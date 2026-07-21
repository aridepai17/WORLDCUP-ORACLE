import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TeamFlag } from "./TeamFlag";
import { Team } from "@workspace/api-client-react";
import { ChevronDown, Search, Check } from "lucide-react";

interface TeamSelectProps {
	teams: Team[];
	value: string;
	onChange: (code: string) => void;
	placeholder?: string;
	disabledCode?: string;
}

export function TeamSelect({
	teams,
	value,
	onChange,
	placeholder = "Select team",
	disabledCode,
}: TeamSelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);

	const selectedTeam = teams.find((t) => t.code === value);

	const filteredTeams = teams.filter(
		(t) =>
			t.code !== disabledCode &&
			(t.name.toLowerCase().includes(search.toLowerCase()) ||
				t.code.toLowerCase().includes(search.toLowerCase())),
	);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="relative w-full" ref={containerRef}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-md hover:border-primary/50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
			>
				{selectedTeam ? (
					<div className="flex items-center gap-3">
						<TeamFlag flagCode={selectedTeam.flagCode} size="sm" />
						<span className="font-semibold text-foreground tracking-wide">
							{selectedTeam.name}
						</span>
						<span className="text-muted-foreground font-mono text-sm">
							{selectedTeam.code}
						</span>
					</div>
				) : (
					<span className="text-muted-foreground">{placeholder}</span>
				)}
				<ChevronDown className="w-4 h-4 text-muted-foreground" />
			</button>

			{isOpen && (
				<div className="absolute z-50 top-full left-0 w-full mt-2 bg-card border border-border rounded-md shadow-xl overflow-hidden flex flex-col">
					<div className="p-2 border-b border-border flex items-center gap-2 px-3">
						<Search className="w-4 h-4 text-muted-foreground" />
						<input
							type="text"
							className="w-full bg-transparent border-none focus:outline-none text-sm py-1 placeholder:text-muted-foreground font-sans"
							placeholder="Search team..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							autoFocus
						/>
					</div>
					<div className="max-h-60 overflow-y-auto py-1">
						{filteredTeams.length === 0 ? (
							<div className="px-4 py-3 text-sm text-muted-foreground text-center">
								No teams found.
							</div>
						) : (
							filteredTeams.map((team) => (
								<button
									key={team.code}
									className="w-full flex items-center px-4 py-2 hover:bg-muted/50 transition-colors text-left"
									onClick={() => {
										onChange(team.code);
										setIsOpen(false);
										setSearch("");
									}}
								>
									<TeamFlag
										flagCode={team.flagCode}
										size="sm"
										className="mr-3"
									/>
									<span className="font-medium flex-1">
										{team.name}
									</span>
									<span className="font-mono text-xs text-muted-foreground mr-3">
										{team.code}
									</span>
									{value === team.code && (
										<Check className="w-4 h-4 text-primary" />
									)}
								</button>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}
