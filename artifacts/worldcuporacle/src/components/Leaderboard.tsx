import { useGetLeaderboard } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { TeamFlag } from "./TeamFlag";
import { CountUp } from "./CountUp";
import { cn } from "@/lib/utils";
import { Trophy, AlertTriangle } from "lucide-react";

export function Leaderboard() {
	const { data: leaderboard, isLoading } = useGetLeaderboard();

	if (isLoading || !leaderboard) {
		return (
			<div className="h-96 w-full animate-pulse bg-card/50 rounded-lg"></div>
		);
	}

	// Filter out teams with 0 probability if we want, or just show top N.
	// The brief says "all 48 teams", so we'll show them, but maybe in a scrollable container.

	const maxProbability = Math.max(
		...leaderboard.map((t) => t.titleProbability),
	);

	return (
		<div className="bg-card border border-border/50 rounded-xl flex flex-col h-[420px] sm:h-[600px] overflow-hidden">
			<div className="p-4 md:p-6 border-b border-border/50 flex justify-between items-center bg-card z-10">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-primary/10 rounded-lg">
						<Trophy className="w-5 h-5 text-primary" />
					</div>
					<h2 className="text-xl font-bold uppercase tracking-wider">
						Title Probability
					</h2>
				</div>
				<div className="text-xs text-muted-foreground font-mono uppercase">
					Live Rankings
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
				{leaderboard.map((team, index) => {
					const isEliminated = team.eliminated;
					const barWidth =
						team.titleProbability > 0
							? (team.titleProbability / maxProbability) * 100
							: 0;

					return (
						<motion.div
							key={team.code}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{
								duration: 0.4,
								delay: index * 0.05,
								ease: "easeOut",
							}}
							className={cn(
								"relative group rounded-lg border border-transparent p-3 transition-colors",
								isEliminated
									? "opacity-50 hover:opacity-100 grayscale hover:grayscale-0"
									: "hover:bg-muted/30 hover:border-border",
							)}
						>
							<div className="flex items-center gap-2 sm:gap-4 relative z-10">
								<div className="w-5 sm:w-6 text-center font-mono text-sm text-muted-foreground font-bold">
									{index + 1}
								</div>

								<TeamFlag flagCode={team.flagCode} size="sm" />

								<div className="flex-1 min-w-0">
									<div className="flex items-baseline gap-2">
										<span
											className={cn(
												"font-bold truncate",
												isEliminated
													? "line-through text-muted-foreground"
													: "text-foreground",
											)}
										>
											{team.name}
										</span>
										<span className="text-xs font-mono text-muted-foreground hidden md:inline-block">
											{team.code}
										</span>
										{isEliminated && (
											<span className="text-[10px] font-mono text-destructive uppercase tracking-wider flex items-center gap-1 border border-destructive/30 px-1.5 py-0.5 rounded-sm bg-destructive/10">
												<AlertTriangle className="w-3 h-3" />{" "}
												Eliminated
											</span>
										)}
									</div>

									<div className="mt-2 h-1.5 w-full bg-card-border rounded-full overflow-hidden">
										<motion.div
											initial={{ width: 0 }}
											animate={{ width: `${barWidth}%` }}
											transition={{
												duration: 1,
												delay: 0.2 + index * 0.05,
												ease: "easeOut",
											}}
											className={cn(
												"h-full rounded-full",
												isEliminated
													? "bg-muted-foreground"
													: "bg-primary shadow-[0_0_10px_rgba(20,250,90,0.5)]",
											)}
										/>
									</div>
								</div>

								<div className="text-right flex flex-col items-end justify-center min-w-[56px] sm:min-w-[70px]">
									<span
										className={cn(
											"text-lg font-mono font-bold",
											isEliminated
												? "text-muted-foreground"
												: "text-primary",
										)}
									>
										<CountUp
											value={team.titleProbability * 100}
											decimals={1}
											suffix="%"
											duration={1.5}
										/>
									</span>
									<span className="text-[10px] text-muted-foreground font-mono uppercase">
										Stage: {team.stage}
									</span>
								</div>
							</div>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}
