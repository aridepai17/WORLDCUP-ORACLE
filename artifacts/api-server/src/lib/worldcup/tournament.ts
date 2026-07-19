import { computeEloRatings } from "./elo";
import { parseResultsCsv, type MatchRow } from "./csv";
import { computeMatchModel, mulberry32, samplePoisson } from "./poisson";
import { TEAM_META_BY_NAME, type TeamMeta } from "./teamMeta";

const WC_2026_CUTOFF = "2026-06-11";
const SIMULATIONS = 10000;
const RNG_SEED = 202607015;

export interface Team {
    code: string;
    name: string;
    flagCode: string;
    confederation: string;
    elo: number;
    group: string;
}

export interface LeaderboardEntry extends Team {
    stage: string;
    eliminated: boolean;
    titleProbability: number;
    finalProbability: number;
    groupWinProbability: number;
}

export interface Fixture {
    round: string;
    date: string;
    teamACode: string | null;
    teamAName: string | null;
    teamBCode: string | null;
    teamBName: string | null;
    teamAScore: number | null;
    teamBScore: number | null;
    status: "completed" | "upcoming";
}

export interface TournamentMeta {
    totalHistoricalMatches: number;
    datasetSinceYear: number;
    simulations: number;
    teamsCount: number;
    asOfDate: string;
    currentStage: string;
    remainingFixtures: number;
}

export interface WorldCupData {
    teams: Team[];
    leaderboard: LeaderboardEntry[];
    fixtures: Fixture[];
    meta: TournamentMeta;
    eloByName: Map<string, number>;
}

interface GroupStanding {
    team: string;
    group: string;
    points: number;
    goalDiff: number;
    goalsFor: number;
}

function buildGroups(groupRows: MatchRow[]): Map<string, string> {
    const adjacency = new Map<string, Set<string>>();
    const addEdge = (a: string, b: string) => {
        if (!adjacency.has(a)) adjacency.set(a, new Set());
        if (!adjacency.has(b)) adjacency.set(b, new Set());
        adjacency.get(a)!.add(b);
        adjacency.get(b)!.add(a);
    };
    for (const row of groupRows) addEdge(row.homeTeam, row.awayTeam);

    const seen = new Set<string>();
    const components: string[][] = [];
    for (const team of adjacency.keys()) {
        if (seen.has(team)) continue;
        const stack = [team];
        const comp: string[] = [];
        seen.add(team);
        while (stack.length) {
            const t = stack.pop()!;
            comp.push(t);
            for (const n of adjacency.get(t)!) {
                if (!seen.has(n)) {
                    seen.add(n);
                    stack.push(n);
                }
            }
        }
        components.push(comp.sort());
    }
    components.sort((a, b) => a[0].localeCompare(b[0]));

    const teamGroup = new Map<string, string>();
    components.forEach((comp, i) => {
        const letter = String.fromCharCode(65 + i);
        for ( const team of comp ) teamGroup.set(team, letter);
    });
    return teamGroup;
}

function computeGroupStandings(groupRows: MatchRow[], teamGroup: Map<string, string>): GroupStanding[] {
    const table = new Map<string, GroupStanding>();
    const ensure = (team: string) => {
        if (!table.has(team)) {
            table.set(team, { team, group: teamGroup.get(team) ?? "?", points: 0, goalDiff: 0, goalsFor: 0});
        }
        return table.get(team)!;
    };

    for (const row of groupRows) {
        const home = ensure(row.homeTeam);
        const away = ensure(row.awayTeam);
        const hs = row.homeScore ?? 0;
        const as = row.awayScore ?? 0;
        home.goalsFor += hs;
        away.goalsFor += as;
        home.goalDiff += hs - as;
        away.goalDiff += as - hs;
        if (hs > as) home.points += 3;
        else if (as > hs) away.points += 3;
        else {
            home.points += 1;
            away.points += 1;
        }
    }

    return [...table.values()];
}

function rankStandings(a: GroupStanding, b: GroupStanding): number {
    return b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor || a.team.localeCompare(b.team);
}

/*
 * Loads the historical results CSV, computes pre-tournament Elo ratings,
 * reconstructs the embedded 2026 World Cup bracket, and runs a seeded
 * Monte Carlo simulation of the still-undecided semifinal / final rounds.
 * Everything is computed once at server startup and cached in memory.
 */

export function buildWorldCupData(csvText: string): WorldCupData {
    const rows = parseResultsCsv(csvText);
    const eloByName = computeEloRatings(rows, WC_2026_CUTOFF);

    const wc2026 = rows.filter((r) => r.tournament === "FIFA World Cup" && r.date.startsWith("2026")).sort((a, b) => a.date.localeCompare(b.date));

    const groupRows = wc2026.slice(0, 72);
    const r32Rows = wc2026.slice(72, 88);
    const r16Rows = wc2026.slice(88, 96);
    const qfRows = wc2026.slice(96, 100);
    const sfRows = wc2026.slice(100, 102);
    const thirdPlaceRow = wc2026[102];
    const finalRow = wc2026[103];

    const teamGroup = buildGroups(groupRows);
    const standings = computeGroupStandings(groupRows, teamGroup);

    const groupWinners = new Set<string>();
    const groupsMap = new Map<string, GroupStanding[]>();
    for (const s of standings) {
        if (!groupsMap.has(s.group)) groupsMap.set(s.group, []);
        groupsMap.get(s.group)!.push(s);
    }
    for (const [, teams] of groupsMap) {
        teams.sort(rankStandings);
        groupWinners.add(teams[0].team);
    }

    const stageForTeam = (team: string): { stage: string; eliminated: boolean} => {
        const inRound = (rowsForRound: MatchRow[]) => 
            rowsForRound.some((r) => r.homeTeam === team || r.awayTeam === team);

        if (inRound(sfRows)) return { stage: "Semifinals", eliminated: false };
        if (inRound(qfRows)) return { stage: "Quarterfinals", eliminated: true };
        if (inRound(r16Rows)) return { stage: "Round of 16", eliminated: true };
        if (inRound(r32Rows)) return { stage: "Round of 32", eliminated: true };
        return { stage: "Group Stage", eliminated: true };
    };

    const semifinalists = sfRows.flatMap((r) => [r.homeTeam, r.awayTeam]);

    // --- Monte Carlo simulation of the undecided seminfinal/final rounds ---
    const rng = mulberry32(RNG_SEED);
    const titleWins = new Map<string, number>();
    const finalReached = new Map<string, number>();
    for (const t of semifinalists) {
        titleWins.set(t, 0);
        finalReached.set(t, 0);
    }

    const eloOf = (team: string) => eloByName.get(team) ?? 1500;

    function simulateKnockout(teamA: string, teamB: string): string {
        const { lambdaA, lambdaB } = computeMatchModel(eloOf(teamA), eloOf(teamB), true);
        const goalsA = samplePoisson(lambdaA, rng);
        const goalsB = samplePoisson(lambdaB, rng);
        if (goalsA > goalsB) return teamA;
        if (goalsB > goalsA) return teamB;
        // Draw: resolved via extra time + penalties, models as slightly Elo-weighted coin flip rather than another full goal simulation
        const diff = eloOf(teamA) - eloOf(teamB);
        const pA = 1 / (1 + Math.pow(10, -diff / 600));
        return rng() < pA ? teamA : teamB;
    }

    const [sf1A, sf1B] = [sfRows[0].homeTeam, sfRows[0].awayTeam];
    const [sf2A, sf2B] = [sfRows[1].homeTeam, sfRows[1].awayTeam];

    for (let i = 0; i < SIMULATIONS; i++) {
        const sf1Winner = simulateKnockout(sf1A, sf1B);
        const sf2Winner = simulateKnockout(sf2A, sf2B);
        finalReached.set(sf1Winner, (finalReached.get(sf1Winner) ?? 0) + 1);
        finalReached.set(sf2Winner, (finalReached.get(sf2Winner) ?? 0) + 1);
        const champion = simulateKnockout(sf1Winner, sf2Winner);
        titleWins.set(champion, (titleWins.get(champion) ?? 0) + 1);
    }

    // --- Assemble teams + leaderboard ---
    const teams: Team[] = [];
    const leaderboard: LeaderboardEntry[] = [];

    for (const [name, meta] of TEAM_META_BY_NAME) {
        const elo = Math.round(eloOf(name));
        const group = teamGroup.get(name) ?? "?";
        const team: Team = {
            code: meta.code,
            name,
            flagCode: meta.flagCode,
            confederation: meta.confederation,
            elo,
            group,
        };
        teams.push(team);

        const { stage, eliminated } = stageForTeam(name);
        leaderboard.push({
            ...team,
            stage,
            eliminated,
            titleProbability: (titleWins.get(name) ?? 0) / SIMULATIONS,
            finalProbability: (finalReached.get(name) ?? 0) / SIMULATIONS,
            groupWinProbability: groupWinners.has(name) ? 1 : 0,
        });
    }

    leaderboard.sort((a, b) => b.titleProbability - a.titleProbability || b.elo - a.elo);
    teams.sort((a, b) => b.elo - a.elo);

    // Fixtures for display
    const toFixture = (row: MatchRow): Fixture => {
        const homeMeta = TEAM_META_BY_NAME.get(row.homeTeam);
        const awayMeta = TEAM_META_BY_NAME.get(row.awayTeam);
        const group = teamGroup.get(row.homeTeam);
        let round: string;
        if (groupRows.includes(row)) round = `Group ${group}`;
        else if (r32Rows.includes(row)) round = "Round of 32";
        else if (r16Rows.includes(row)) round = "Round of 16";
        else if (qfRows.includes(row)) round = "Quarterfinal";
        else if (sfRows.includes(row)) round = "Semifinal";
        else round = "Match";

        return {
            round,
            date: row.date,
            teamACode: homeMeta?.code ?? null,
            teamAName: row.homeTeam || null,
            teamBCode: awayMeta?.code ?? null,
            teamBName: row.awayTeam || null,
            teamAScore: row.homeScore,
            teamBScore: row.awayScore,
            status: row.homeScore !== null && row.awayScore !== null ? "completed" : "upcoming",
        };
    };

    const fixtures: Fixture[] = [
        ...groupRows.map(toFixture),
        ...r32Rows.map(toFixture),
        ...r16Rows.map(toFixture),
        ...qfRows.map(toFixture),
        ...sfRows.map(toFixture),
    ];

    if (thirdPlaceRow) {
        fixtures.push({
            round: "Third Place Playoff",
            date: thirdPlaceRow.date,
            teamACode: null,
            teamAName: null,
            teamBCode: null,
            teamBName: null,
            teamAScore: null,
            teamBScore: null,
            status: "upcoming",
        });
    }
    if (finalRow) {
        fixtures.push({
            round: "Final",
            date: finalRow.date,
            teamACode: null,
            teamAName: null,
            teamBCode: null,
            teamBName: null,
            teamAScore: null,
            teamBScore: null,
            status: "upcoming",
        });
    }

    const oldestYear = rows.reduce((min, r) => Math.min(min, Number(r.date.slice(0, 4)) || min), 9999);
    const remainingFixtures = fixtures.filter((f) => f.status === "upcoming").length;

    const meta: TournamentMeta = {
        totalHistoricalMatches: rows.length,
        datasetSinceYear: oldestYear,
        simulations: SIMULATIONS,
        teamsCount: teams.length,
        asOfDate: "2026-07-15",
        currentStage: "Semifinals",
        remainingFixtures,
    };

    return { teams, leaderboard, fixtures, meta, eloByName};
}