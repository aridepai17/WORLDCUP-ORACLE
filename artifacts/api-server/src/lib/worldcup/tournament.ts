import { computeEloRatings } from "./elo";
import { parseResultsCsv, type MatchRow } from "./csv";
import { computeMatchModel, expectedGoals, mulberry32, samplePoisson } from "./poisson";
import { TEAM_META, TEAM_META_BY_NAME, type TeamMeta } from "./teamMeta";

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
    preTournamentTitleProbability: number;
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

    const teamGroup = new Map(TEAM_META.map((t) => [t.name, t.group]));
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
        return { stage: "Pre-Tournament", eliminated: false };
    };

    const preTournamentTitleWins = new Map<string, number>();
    const preTournamentGroupWins = new Map<string, number>();
    const preTournamentFinalAppearances = new Map<string, number>();
    for (const t of TEAM_META_BY_NAME.keys()) {
        preTournamentTitleWins.set(t, 0);
        preTournamentGroupWins.set(t, 0);
        preTournamentFinalAppearances.set(t, 0);
    }

    const eloOf = (team: string) => eloByName.get(team) ?? 1500;

    function simulateKnockout(teamA: string, teamB: string, rng: () => number): string {
        const { lambdaA, lambdaB } = computeMatchModel(eloOf(teamA), eloOf(teamB), true);
        const goalsA = samplePoisson(lambdaA, rng);
        const goalsB = samplePoisson(lambdaB, rng);
        if (goalsA > goalsB) return teamA;
        if (goalsB > goalsA) return teamB;
        const diff = eloOf(teamA) - eloOf(teamB);
        const pA = 1 / (1 + Math.pow(10, -diff / 600));
        return rng() < pA ? teamA : teamB;
    }

    const R32_TEMPLATE: Array<[string, string]> = [
        ["2D", "2J"],
        ["1E", "2L"],
        ["1I", "3B"],
        ["1L", "2E"],
        ["2I", "2K"],
        ["1K", "3L"],
        ["1J", "3I"],
        ["1H", "3G"],
        ["1C", "3K"],
        ["1B", "3D"],
        ["1F", "2A"],
        ["1G", "2H"],
        ["1D", "3A"],
        ["2B", "2C"],
        ["1A", "3F"],
        ["2G", "3H"],
    ];

    const R16_BRACKET: Array<[number, number]> = [
        [0, 3],
        [2, 5],
        [1, 4],
        [6, 7],
        [11, 10],
        [9, 8],
        [14, 13],
        [12, 15],
    ];

    const QF_BRACKET: Array<[number, number]> = [
        [0, 1],
        [2, 3],
        [4, 5],
        [6, 7],
    ];

    const SF_BRACKET: Array<[number, number]> = [
        [0, 1],
        [2, 3],
    ];

    function getQualifiers(groupResults: Map<string, { team: string; points: number; gd: number; gf: number }>, rng: () => number): Map<string, string> {
        const qualifiers = new Map<string, string>();
        const thirdPlaceTeams: { team: string; group: string; points: number; gd: number; gf: number }[] = [];

        const groupRoster = new Map<string, string[]>();
        for (const [team, group] of teamGroup.entries()) {
            if (!groupRoster.has(group)) groupRoster.set(group, []);
            groupRoster.get(group)!.push(team);
        }

        for (const [g, groupTeams] of groupRoster) {
            const stats = new Map<string, { points: number; gd: number; gf: number }>();
            for (const t of groupTeams) {
                stats.set(t, { points: 0, gd: 0, gf: 0 });
            }

            for (const row of groupRows) {
                const home = row.homeTeam;
                const away = row.awayTeam;
                const homeGroup = teamGroup.get(home);
                if (!homeGroup || homeGroup !== g) continue;
                if (!stats.has(home) || !stats.has(away)) continue;

                const { lambdaA, lambdaB } = expectedGoals(eloOf(home), eloOf(away), row.neutral);
                const goalsA = samplePoisson(lambdaA, rng);
                const goalsB = samplePoisson(lambdaB, rng);

                if (goalsA > goalsB) {
                    stats.get(home)!.points += 3;
                } else if (goalsB > goalsA) {
                    stats.get(away)!.points += 3;
                } else {
                    stats.get(home)!.points += 1;
                    stats.get(away)!.points += 1;
                }
                stats.get(home)!.gd += goalsA - goalsB;
                stats.get(away)!.gd += goalsB - goalsA;
                stats.get(home)!.gf += goalsA;
                stats.get(away)!.gf += goalsB;
            }

            const sorted = [...stats.entries()]
                .map(([team, s]) => ({ team, points: s.points, gd: s.gd, gf: s.gf, group: g }))
                .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

            if (sorted.length > 0) qualifiers.set("1" + g, sorted[0].team);
            if (sorted.length > 1) qualifiers.set("2" + g, sorted[1].team);
            if (sorted.length > 2) {
                thirdPlaceTeams.push({ ...sorted[2], group: g });
            }
        }

        thirdPlaceTeams.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
        for (let i = 0; i < Math.min(8, thirdPlaceTeams.length); i++) {
            qualifiers.set("3" + thirdPlaceTeams[i].group, thirdPlaceTeams[i].team);
        }

        return qualifiers;
    }

    function simulateBracket(qualifiers: Map<string, string>, rng: () => number): string {
        function getTeam(pos: string): string {
            return qualifiers.get(pos) ?? "BYE";
        }

        let r32Winners: string[] = [];
        for (const [homePos, awayPos] of R32_TEMPLATE) {
            const home = getTeam(homePos);
            const away = getTeam(awayPos);
            if (home === "BYE" || away === "BYE") {
                r32Winners.push(home === "BYE" ? away : home);
            } else {
                r32Winners.push(simulateKnockout(home, away, rng));
            }
        }

        let r16Winners: string[] = [];
        for (const [i, j] of R16_BRACKET) {
            const a = r32Winners[i];
            const b = r32Winners[j];
            if (a === "BYE" || b === "BYE") {
                r16Winners.push(a === "BYE" ? b : a);
            } else {
                r16Winners.push(simulateKnockout(a, b, rng));
            }
        }

        let qfWinners: string[] = [];
        for (const [i, j] of QF_BRACKET) {
            const a = r16Winners[i];
            const b = r16Winners[j];
            if (a === "BYE" || b === "BYE") {
                qfWinners.push(a === "BYE" ? b : a);
            } else {
                qfWinners.push(simulateKnockout(a, b, rng));
            }
        }

        let sfWinners: string[] = [];
        for (const [i, j] of SF_BRACKET) {
            const a = qfWinners[i];
            const b = qfWinners[j];
            if (a === "BYE" || b === "BYE") {
                sfWinners.push(a === "BYE" ? b : a);
            } else {
                sfWinners.push(simulateKnockout(a, b, rng));
            }
        }

        if (sfWinners.length < 2) return sfWinners[0] ?? "UNKNOWN";
        return simulateKnockout(sfWinners[0], sfWinners[1], rng);
    }

    for (let i = 0; i < SIMULATIONS; i++) {
        const rng = mulberry32(RNG_SEED + i);
        const qualifiers = getQualifiers(new Map(), rng);
        const champion = simulateBracket(qualifiers, rng);
        if (champion !== "BYE" && champion !== "UNKNOWN") {
            preTournamentTitleWins.set(champion, (preTournamentTitleWins.get(champion) ?? 0) + 1);
        }

        const groupRoster = new Map<string, string[]>();
        for (const [team, group] of teamGroup.entries()) {
            if (!groupRoster.has(group)) groupRoster.set(group, []);
            groupRoster.get(group)!.push(team);
        }
        for (const [group, groupTeams] of groupRoster) {
            const stats = new Map<string, { points: number; gd: number; gf: number }>();
            for (const t of groupTeams) {
                stats.set(t, { points: 0, gd: 0, gf: 0 });
            }
            for (const row of groupRows) {
                const home = row.homeTeam;
                const away = row.awayTeam;
                const homeGroup = teamGroup.get(home);
                if (!homeGroup || homeGroup !== group) continue;
                if (!stats.has(home) || !stats.has(away)) continue;
                const { lambdaA, lambdaB } = expectedGoals(eloOf(home), eloOf(away), row.neutral);
                const goalsA = samplePoisson(lambdaA, rng);
                const goalsB = samplePoisson(lambdaB, rng);
                if (goalsA > goalsB) stats.get(home)!.points += 3;
                else if (goalsB > goalsA) stats.get(away)!.points += 3;
                else { stats.get(home)!.points += 1; stats.get(away)!.points += 1; }
                stats.get(home)!.gd += goalsA - goalsB;
                stats.get(away)!.gd += goalsB - goalsA;
                stats.get(home)!.gf += goalsA;
                stats.get(away)!.gf += goalsB;
            }
            const sorted = [...stats.entries()].sort((a, b) => b[1].points - a[1].points || b[1].gd - a[1].gd || b[1].gf - a[1].gf);
            if (sorted.length > 0) {
                preTournamentGroupWins.set(sorted[0][0], (preTournamentGroupWins.get(sorted[0][0]) ?? 0) + 1);
            }
        }
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
            titleProbability: (preTournamentTitleWins.get(name) ?? 0) / SIMULATIONS,
            finalProbability: (preTournamentFinalAppearances.get(name) ?? 0) / SIMULATIONS,
            groupWinProbability: (preTournamentGroupWins.get(name) ?? 0) / SIMULATIONS,
            preTournamentTitleProbability: (preTournamentTitleWins.get(name) ?? 0) / SIMULATIONS,
        });
    }

    leaderboard.sort((a, b) => b.titleProbability - a.titleProbability || b.elo - a.elo);
    teams.sort((a, b) => b.elo - a.elo);

    const fixtures: Fixture[] = [
        ...groupRows.map((row) => {
            const homeMeta = TEAM_META_BY_NAME.get(row.homeTeam);
            const awayMeta = TEAM_META_BY_NAME.get(row.awayTeam);
            const group = teamGroup.get(row.homeTeam);
            return {
                round: `Group ${group}`,
                date: row.date,
                teamACode: homeMeta?.code ?? null,
                teamAName: row.homeTeam || null,
                teamBCode: awayMeta?.code ?? null,
                teamBName: row.awayTeam || null,
                teamAScore: row.homeScore,
                teamBScore: row.awayScore,
                status: "completed" as const,
            };
        }),
        ...r32Rows.map((row) => {
            const homeMeta = TEAM_META_BY_NAME.get(row.homeTeam);
            const awayMeta = TEAM_META_BY_NAME.get(row.awayTeam);
            return {
                round: "Round of 32",
                date: row.date,
                teamACode: homeMeta?.code ?? null,
                teamAName: row.homeTeam || null,
                teamBCode: awayMeta?.code ?? null,
                teamBName: row.awayTeam || null,
                teamAScore: row.homeScore,
                teamBScore: row.awayScore,
                status: "completed" as const,
            };
        }),
        ...r16Rows.map((row) => {
            const homeMeta = TEAM_META_BY_NAME.get(row.homeTeam);
            const awayMeta = TEAM_META_BY_NAME.get(row.awayTeam);
            return {
                round: "Round of 16",
                date: row.date,
                teamACode: homeMeta?.code ?? null,
                teamAName: row.homeTeam || null,
                teamBCode: awayMeta?.code ?? null,
                teamBName: row.awayTeam || null,
                teamAScore: row.homeScore,
                teamBScore: row.awayScore,
                status: "completed" as const,
            };
        }),
        ...qfRows.map((row) => {
            const homeMeta = TEAM_META_BY_NAME.get(row.homeTeam);
            const awayMeta = TEAM_META_BY_NAME.get(row.awayTeam);
            return {
                round: "Quarterfinal",
                date: row.date,
                teamACode: homeMeta?.code ?? null,
                teamAName: row.homeTeam || null,
                teamBCode: awayMeta?.code ?? null,
                teamBName: row.awayTeam || null,
                teamAScore: row.homeScore,
                teamBScore: row.awayScore,
                status: "completed" as const,
            };
        }),
        {
            round: "Semifinal",
            date: "2026-07-14",
            teamACode: "FRA",
            teamAName: "France",
            teamBCode: "ESP",
            teamBName: "Spain",
            teamAScore: 0,
            teamBScore: 2,
            status: "completed" as const,
        },
        {
            round: "Semifinal",
            date: "2026-07-15",
            teamACode: "ENG",
            teamAName: "England",
            teamBCode: "ARG",
            teamBName: "Argentina",
            teamAScore: 1,
            teamBScore: 2,
            status: "completed" as const,
        },
        {
            round: "Third Place Playoff",
            date: "2026-07-18",
            teamACode: "ENG",
            teamAName: "England",
            teamBCode: "FRA",
            teamBName: "France",
            teamAScore: 6,
            teamBScore: 4,
            status: "completed" as const,
        },
        {
            round: "Final",
            date: "2026-07-19",
            teamACode: "ESP",
            teamAName: "Spain",
            teamBCode: "ARG",
            teamBName: "Argentina",
            teamAScore: 1,
            teamBScore: 0,
            status: "completed" as const,
        },
    ];

    const oldestYear = rows.reduce((min, r) => Math.min(min, Number(r.date.slice(0, 4)) || min), 9999);
    const remainingFixtures = fixtures.filter((f) => f.status === "upcoming").length;

    const meta: TournamentMeta = {
        totalHistoricalMatches: rows.length,
        datasetSinceYear: oldestYear,
        simulations: SIMULATIONS,
        teamsCount: teams.length,
        asOfDate: "2026-07-21",
        currentStage: "Completed",
        remainingFixtures,
    };

    return { teams, leaderboard, fixtures, meta, eloByName};
}