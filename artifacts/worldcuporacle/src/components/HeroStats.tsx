import { useGetTournamentMeta } from "@workspace/api-client-react";
import { CountUp } from "./CountUp";
import { Database, RefreshCw } from "lucide-react";

export function HeroStats() {
	const { data: meta, isLoading } = useGetTournamentMeta();

	if (isLoading || !meta) {
		return (
			<div className="h-32 w-full animate-pulse bg-card/50 rounded-lg"></div>
		);
	}

	return (
		<div className="w-full bg-card border border-border/50 rounded-xl overflow-hidden relative">
			{/* Broadcast accent bar */}
			<div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(20,250,90,0.5)]"></div>

			<div className="p-6 md:p-8">
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
					<div className="space-y-2">
						<div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold uppercase tracking-wider mb-2">
							<span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
							Live Oracle Network
						</div>
						<h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
							2026 World Cup
						</h1>
						<p className="text-xl text-muted-foreground font-mono">
							Stage:{" "}
							<span className="text-white font-bold">
								{meta.currentStage}
							</span>
						</p>
					</div>

					<div className="grid grid-cols-2 gap-4 md:gap-8 w-full md:w-auto">
						<div className="flex flex-col">
							<span className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1 flex items-center gap-1.5">
								<RefreshCw className="w-3 h-3" /> Simulations
							</span>
							<div className="text-2xl md:text-3xl font-bold font-mono text-white">
								<CountUp value={meta.simulations} />
							</div>
						</div>

						<div className="flex flex-col">
							<span className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1 flex items-center gap-1.5">
								<Database className="w-3 h-3" /> Dataset
							</span>
							<div className="text-2xl md:text-3xl font-bold font-mono text-white">
								<CountUp value={meta.totalHistoricalMatches} />
							</div>
							<span className="text-[10px] text-muted-foreground mt-0.5 font-mono">
								Matches since {meta.datasetSinceYear}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
