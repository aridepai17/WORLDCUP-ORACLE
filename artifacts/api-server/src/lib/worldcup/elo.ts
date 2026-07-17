import type { MatchRow } from "./csv";

const K_BASE = 20;
const HOME_ADVANTAGE = 100;
const CURRENT_YEAR = 2026;

function tournamentWeight(tournament: string): number {
	const t = tournament.toLowerCase();
    if (t.includes("qualification") || t.includes("qualifying")) return 40;
	if (t.includes("world cup")) return 60;
	if (
		t.includes("euro") ||
		t.includes("copa américa") ||
		t.includes("copa america") ||
		t.includes("african cup of nations") ||
		t.includes("africa cup of nations") ||
		t.includes("asian cup") ||
		t.includes("gold cup") ||
		t.includes("confederations cup") ||
		t.includes("nations league finals")
	) {
		return 50;
	}
	if (t === "friendly") return 20;
	return 30;
}

function recencyFactor(year: number, targetYear: number): number {
	const age = targetYear - year;
	if (age <= 8) return 1.0;
	if (age <= 20) return 0.85;
	return 0.7;
}

function goalDiffMultiplier(goalDiff: number): number {
	const abs = Math.abs(goalDiff);
	if (abs <= 1) return 1;
	if (abs === 2) return 1.5;
	return 1.75 + (abs - 3) / 8;
}

/**
 * Computes Elo ratings for every team using full match history strictly
 * before `cutoffDate`, so the resulting ratings reflect pre-tournament
 * strength without leaking any tournament outcomes.
 */
export function computeEloRatings(
	rows: MatchRow[],
	cutoffDate: string,
): Map<string, number> {
	const ratings = new Map<string, number>();
	const targetYear = Number(cutoffDate.slice(0, 4)) || 2026;

	const rated = rows
		.filter(
			(r) =>
				r.homeScore !== null &&
				r.awayScore !== null &&
				r.date < cutoffDate,
		)
		.sort((a, b) => a.date.localeCompare(b.date));

	const getRating = (team: string) => ratings.get(team) ?? 1500;

	for (const m of rated) {
		const rHome = getRating(m.homeTeam);
		const rAway = getRating(m.awayTeam);
		const homeAdv = m.neutral ? 0 : HOME_ADVANTAGE;
		const diff = rHome + homeAdv - rAway;
		const expectedHome = 1 / (1 + Math.pow(10, -diff / 400));

		const goalDiff = (m.homeScore as number) - (m.awayScore as number);
		const actualHome = goalDiff > 0 ? 1 : goalDiff < 0 ? 0 : 0.5;

		const year = Number(m.date.slice(0, 4));
		const weight = tournamentWeight(m.tournament);
		const k =
			K_BASE *
			(weight / 40) *
			recencyFactor(year, targetYear) * 
			goalDiffMultiplier(goalDiff);

		const delta = k * (actualHome - expectedHome);
		ratings.set(m.homeTeam, rHome + delta);
		ratings.set(m.awayTeam, rAway - delta);
	}

	return ratings;
}
