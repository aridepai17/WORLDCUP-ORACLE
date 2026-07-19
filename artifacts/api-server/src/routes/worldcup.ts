import { Router, type IRouter } from "express";
import {
	GetTournamentMetaResponse,
	ListTeamsResponse,
	GetLeaderboardResponse,
	ListFixturesResponse,
	SimulateMatchBody,
	SimulateMatchResponse,
} from "@workspace/api-zod";
import { getWorldCupData } from "../lib/worldcup/cache";
import { computeMatchModel } from "../lib/worldcup/poisson";
import { TEAM_META_BY_CODE } from "../lib/worldcup/teamMeta";

const router: IRouter = Router();

router.get("/worldcup/meta", (req, res) => {
	const { meta } = getWorldCupData();
	const data = GetTournamentMetaResponse.parse(meta);
	req.log.info({ meta: data }, "served tournament meta");
	res.json(data);
});

router.get("/worldcup/teams", (req, res) => {
	const { teams } = getWorldCupData();
	const data = ListTeamsResponse.parse(teams);
	res.json(data);
});

router.get("/worldcup/leaderboard", (req, res) => {
	const { leaderboard } = getWorldCupData();
	const data = GetLeaderboardResponse.parse(leaderboard);
	res.json(data);
});

router.get("/worldcup/fixtures", (req, res) => {
	const { fixtures } = getWorldCupData();
	const data = ListFixturesResponse.parse(fixtures);
	res.json(data);
});

router.post("/worldcup/simulate-match", (req, res) => {
	const parseResult = SimulateMatchBody.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({ error: "Invalid request body", details: parseResult.error.issues });
        return;
    }

    const body = parseResult.data;
	const { eloByName } = getWorldCupData();
	const teamA = TEAM_META_BY_CODE.get(body.teamACode);
	const teamB = TEAM_META_BY_CODE.get(body.teamBCode);

	if (!teamA || !teamB) {
		res.status(400).json({ error: "Unknown team code" });
		return;
	}

	const model = computeMatchModel(
		eloByName.get(teamA.name) ?? 1500,
		eloByName.get(teamB.name) ?? 1500,
		true,
	);

	const data = SimulateMatchResponse.parse({
		teamACode: teamA.code,
		teamAName: teamA.name,
		teamBCode: teamB.code,
		teamBName: teamB.name,
		teamAWinProbability: model.pWinA,
		drawProbability: model.pDraw,
		teamBWinProbability: model.pWinB,
		teamAExpectedGoals: model.lambdaA,
		teamBExpectedGoals: model.lambdaB,
		teamALikelyGoals: model.likelyA,
		teamBLikelyGoals: model.likelyB,
	});

	req.log.info({ teamA: teamA.code, teamB: teamB.code }, "simulated match");
	res.json(data);
});

export default router;
