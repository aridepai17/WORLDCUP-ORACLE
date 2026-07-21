import { useState } from "react";
import { useListTeams, useSimulateMatch } from "@workspace/api-client-react";
import { TeamSelect } from "./TeamSelect";
import { CountUp } from "./CountUp";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Info } from "lucide-react";
import { TeamFlag } from "./TeamFlag";

export function MatchSimulator() {
	const { data: teams } = useListTeams();
	const simulateMatch = useSimulateMatch();

	const [teamACode, setTeamACode] = useState<string>("");
	const [teamBCode, setTeamBCode] = useState<string>("");

	const handleSimulate = () => {
		if (!teamACode || !teamBCode) return;
		simulateMatch.mutate({ data: { teamACode, teamBCode } });
	};

	const result = simulateMatch.data;
	const isPending = simulateMatch.isPending;

	return (
		<div className="bg-card border border-border/50 rounded-xl p-6 flex flex-col h-full">
			<div className="flex items-center gap-3 mb-6">
				<div className="p-2 bg-primary/10 rounded-lg">
					<Swords className="w-5 h-5 text-primary" />
				</div>
				<h2 className="text-xl font-bold uppercase tracking-wider">
					H2H Simulator
				</h2>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center mb-6">
				<div className="w-full">
					<TeamSelect
						teams={teams || []}
						value={teamACode}
						onChange={(val) => {
							setTeamACode(val);
							simulateMatch.reset();
						}}
						placeholder="Home Team"
						disabledCode={teamBCode}
					/>
				</div>
				<div className="hidden md:flex justify-center items-center w-8 text-muted-foreground font-mono text-sm">
					VS
				</div>
				<div className="w-full">
					<TeamSelect
						teams={teams || []}
						value={teamBCode}
						onChange={(val) => {
							setTeamBCode(val);
							simulateMatch.reset();
						}}
						placeholder="Away Team"
						disabledCode={teamACode}
					/>
				</div>
			</div>

			<button
				onClick={handleSimulate}
				disabled={!teamACode || !teamBCode || isPending}
				className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
			>
				{isPending ? (
					<span className="flex items-center justify-center gap-2">
						<span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
						Crunching Numbers...
					</span>
				) : (
					"Run Simulation"
				)}
				<div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
			</button>

			<div className="flex-1 mt-6 relative min-h-[220px]">
				<AnimatePresence mode="wait">
					{!result && !isPending && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-lg p-6"
						>
							<Info className="w-8 h-8 mb-3 opacity-20" />
							<p className="font-mono text-sm max-w-[250px]">
								Select two teams and run the simulation to see
								projected outcomes based on 10,000 Monte Carlo
								runs.
							</p>
						</motion.div>
					)}

					{isPending && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 flex items-center justify-center"
						>
							<div className="w-full h-full flex items-center gap-2 justify-center opacity-30 font-mono text-sm">
								[ CALCULATING ]
							</div>
						</motion.div>
					)}

					{result && !isPending && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="w-full h-full flex flex-col justify-between"
						>
							{/* Scoreline */}
							<div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-12 py-4">
								<div className="flex flex-col items-center gap-2">
									<TeamFlag
										flagCode={
											teams?.find(
												(t) =>
													t.code === result.teamACode,
											)?.flagCode || ""
										}
										size="md"
									/>
									<span className="font-bold text-sm sm:text-lg">
										{result.teamACode}
									</span>
								</div>

								<div className="flex items-center gap-2 sm:gap-4">
									<div className="text-3xl sm:text-5xl font-black font-mono">
										<CountUp
											value={result.teamALikelyGoals}
											duration={0.8}
										/>
									</div>
									<div className="text-xl sm:text-2xl text-muted-foreground font-mono">
										-
									</div>
									<div className="text-3xl sm:text-5xl font-black font-mono">
										<CountUp
											value={result.teamBLikelyGoals}
											duration={0.8}
										/>
									</div>
								</div>

								<div className="flex flex-col items-center gap-2">
									<TeamFlag
										flagCode={
											teams?.find(
												(t) =>
													t.code === result.teamBCode,
											)?.flagCode || ""
										}
										size="md"
									/>
									<span className="font-bold text-sm sm:text-lg">
										{result.teamBCode}
									</span>
								</div>
							</div>

							{/* Probabilities */}
							<div className="space-y-4">
								<div className="flex justify-between text-xs font-mono text-muted-foreground uppercase">
									<span>{result.teamACode} Win</span>
									<span>Draw</span>
									<span>{result.teamBCode} Win</span>
								</div>

								<div className="w-full h-3 rounded-full overflow-hidden flex bg-card-border">
									<motion.div
										initial={{ width: 0 }}
										animate={{
											width: `${result.teamAWinProbability * 100}%`,
										}}
										className="h-full bg-primary"
									/>
									<motion.div
										initial={{ width: 0 }}
										animate={{
											width: `${result.drawProbability * 100}%`,
										}}
										className="h-full bg-muted-foreground/30"
									/>
									<motion.div
										initial={{ width: 0 }}
										animate={{
											width: `${result.teamBWinProbability * 100}%`,
										}}
										className="h-full bg-blue-500"
									/>
								</div>

								<div className="flex justify-between text-sm font-bold font-mono">
									<span className="text-primary">
										<CountUp
											value={
												result.teamAWinProbability * 100
											}
											decimals={1}
											suffix="%"
										/>
									</span>
									<span className="text-muted-foreground">
										<CountUp
											value={result.drawProbability * 100}
											decimals={1}
											suffix="%"
										/>
									</span>
									<span className="text-blue-500">
										<CountUp
											value={
												result.teamBWinProbability * 100
											}
											decimals={1}
											suffix="%"
										/>
									</span>
								</div>
							</div>

							{/* Expected Goals */}
							<div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/50">
								<div className="text-center">
									<div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">
										Expected Goals (xG)
									</div>
									<div className="text-xl font-mono font-bold">
										<CountUp
											value={result.teamAExpectedGoals}
											decimals={2}
										/>
									</div>
								</div>
								<div className="text-center border-l border-border/50">
									<div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">
										Expected Goals (xG)
									</div>
									<div className="text-xl font-mono font-bold">
										<CountUp
											value={result.teamBExpectedGoals}
											decimals={2}
										/>
									</div>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
