import { useGetLeaderboard } from "@workspace/api-client-react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from "recharts";
import { Activity } from "lucide-react";
import { useMemo } from "react";

export function ChancesChart() {
	const { data: leaderboard, isLoading } = useGetLeaderboard();

	const chartData = useMemo(() => {
		if (!leaderboard) return [];
		// Take the top 16 teams that are NOT eliminated for a cleaner chart
		const activeTeams = leaderboard.filter((t) => !t.eliminated);
		const displayTeams =
			activeTeams.length >= 8
				? activeTeams.slice(0, 16)
				: leaderboard.slice(0, 16);

		return displayTeams
			.map((t) => ({
				name: t.code,
				fullName: t.name,
				finalChance: t.finalProbability * 100,
				groupWinChance: t.groupWinProbability * 100,
				eliminated: t.eliminated,
			}))
			.sort((a, b) => b.finalChance - a.finalChance);
	}, [leaderboard]);

	if (isLoading || !leaderboard) {
		return (
			<div className="h-96 w-full animate-pulse bg-card/50 rounded-lg"></div>
		);
	}

	return (
		<div className="bg-card border border-border/50 rounded-xl flex flex-col h-[360px] sm:h-[440px]">
			<div className="p-4 md:p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-primary/10 rounded-lg">
						<Activity className="w-5 h-5 text-primary" />
					</div>
					<h2 className="text-xl font-bold uppercase tracking-wider">
						Path to Glory
					</h2>
				</div>
				<div className="flex gap-4 items-center">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-full bg-primary" />
						<span className="text-[10px] font-mono uppercase text-muted-foreground">
							Final
						</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
						<span className="text-[10px] font-mono uppercase text-muted-foreground">
							Group Win
						</span>
					</div>
				</div>
			</div>

			<div className="flex-1 p-4 md:p-6 min-h-0">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={chartData}
						margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="hsl(var(--border))"
						/>
						<XAxis
							dataKey="name"
							axisLine={false}
							tickLine={false}
							tick={{
								fill: "hsl(var(--muted-foreground))",
								fontSize: 12,
								fontFamily: "monospace",
							}}
							dy={10}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{
								fill: "hsl(var(--muted-foreground))",
								fontSize: 12,
								fontFamily: "monospace",
							}}
							tickFormatter={(val) => `${val}%`}
						/>
						<Tooltip
							cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									const data = payload[0].payload;
									return (
										<div className="bg-popover border border-border p-3 rounded-lg shadow-xl">
											<p className="font-bold mb-2">
												{data.fullName}
											</p>
											<div className="space-y-1">
												<p className="text-sm font-mono flex justify-between gap-4">
													<span className="text-muted-foreground">
														Reach Final:
													</span>
													<span className="text-primary font-bold">
														{data.finalChance.toFixed(
															1,
														)}
														%
													</span>
												</p>
												<p className="text-sm font-mono flex justify-between gap-4">
													<span className="text-muted-foreground">
														Win Group:
													</span>
													<span className="font-bold text-white">
														{data.groupWinChance.toFixed(
															1,
														)}
														%
													</span>
												</p>
											</div>
										</div>
									);
								}
								return null;
							}}
						/>
						<Bar
							dataKey="finalChance"
							radius={[4, 4, 0, 0]}
							maxBarSize={40}
						>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-final-${index}`}
									fill={
										entry.eliminated
											? "hsl(var(--muted-foreground) / 0.5)"
											: "hsl(var(--primary))"
									}
								/>
							))}
						</Bar>
						<Bar
							dataKey="groupWinChance"
							radius={[4, 4, 0, 0]}
							maxBarSize={40}
						>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-group-${index}`}
									fill={
										entry.eliminated
											? "hsl(var(--muted-foreground) / 0.2)"
											: "hsl(var(--muted-foreground) / 0.3)"
									}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
