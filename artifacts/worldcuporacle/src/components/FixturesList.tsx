import { useListFixtures } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function FixturesList() {
	const { data: fixtures, isLoading } = useListFixtures();

	if (isLoading || !fixtures) {
		return (
			<div className="h-64 w-full animate-pulse bg-card/50 rounded-lg"></div>
		);
	}

	// Filter out placeholders, sort by date descending (most recent first) to see the story
	const validFixtures = fixtures
		.filter((f) => f.teamACode && f.teamBCode)
		.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		);

	// Take the most recent 10 completed matches and next 5 upcoming
	const completed = validFixtures
		.filter((f) => f.status === "completed")
		.slice(0, 10);
	const upcoming = validFixtures
		.filter((f) => f.status === "upcoming")
		.reverse()
		.slice(0, 5); // Reverse to get earliest upcoming first

	const displayFixtures = [...upcoming, ...completed];

	return (
		<div className="bg-card border border-border/50 rounded-xl flex flex-col h-[400px]">
			<div className="p-4 border-b border-border/50 flex justify-between items-center bg-card z-10 sticky top-0">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-secondary/50 rounded-lg">
						<Calendar className="w-5 h-5 text-foreground" />
					</div>
					<h2 className="text-lg font-bold uppercase tracking-wider">
						Tournament Log
					</h2>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4 space-y-2">
				{displayFixtures.map((fixture, idx) => {
					const isUpcoming = fixture.status === "upcoming";
					const teamAWon =
						!isUpcoming &&
						fixture.teamAScore !== null &&
						fixture.teamBScore !== null &&
						fixture.teamAScore > fixture.teamBScore;
					const teamBWon =
						!isUpcoming &&
						fixture.teamAScore !== null &&
						fixture.teamBScore !== null &&
						fixture.teamBScore > fixture.teamAScore;

					return (
						<div
							key={`${fixture.teamACode}-${fixture.teamBCode}-${fixture.date}-${idx}`}
							className={cn(
								"flex items-center justify-between p-2.5 sm:p-3 rounded-lg border gap-2",
								isUpcoming
									? "bg-secondary/20 border-border/50"
									: "bg-muted/10 border-transparent hover:bg-muted/30 transition-colors",
							)}
						>
							<div className="flex flex-col gap-1 w-[56px] sm:w-[80px] shrink-0">
								<span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase truncate">
									{fixture.round}
								</span>
								<span className="text-[11px] sm:text-xs font-mono flex items-center gap-1">
									{isUpcoming ? (
										<Clock className="w-3 h-3 text-primary shrink-0" />
									) : null}
									{format(new Date(fixture.date), "MMM d")}
								</span>
							</div>

							<div className="flex-1 flex justify-center items-center gap-2 sm:gap-4 min-w-0">
								<div
									className={cn(
										"font-bold font-mono text-xs sm:text-base w-9 sm:w-12 text-right truncate",
										teamAWon
											? "text-primary"
											: "text-foreground",
									)}
								>
									{fixture.teamACode}
								</div>

								<div className="bg-background px-2 sm:px-3 py-1 rounded border border-border/50 min-w-[48px] sm:min-w-[60px] text-center font-mono font-bold tracking-widest text-xs sm:text-sm shrink-0">
									{isUpcoming ? (
										<span className="text-muted-foreground">
											vs
										</span>
									) : (
										<span>
											{fixture.teamAScore} -{" "}
											{fixture.teamBScore}
										</span>
									)}
								</div>

								<div
									className={cn(
										"font-bold font-mono text-xs sm:text-base w-9 sm:w-12 text-left truncate",
										teamBWon
											? "text-primary"
											: "text-foreground",
									)}
								>
									{fixture.teamBCode}
								</div>
							</div>

							<div className="w-[18px] sm:w-[30px] flex justify-end shrink-0">
								<ChevronRight className="w-4 h-4 text-muted-foreground/30" />
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
