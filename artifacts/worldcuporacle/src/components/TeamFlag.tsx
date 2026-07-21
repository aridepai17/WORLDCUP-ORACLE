import { cn } from "@/lib/utils";

interface TeamFlagProps {
	flagCode: string;
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function TeamFlag({ flagCode, className, size = "sm" }: TeamFlagProps) {
	const width = size === "sm" ? 40 : 80;

	return (
		<div
			className={cn(
				"relative overflow-hidden bg-muted rounded-[2px] border border-white/10 shrink-0",
				size === "sm" && "w-[30px] h-[20px]",
				size === "md" && "w-[45px] h-[30px]",
				size === "lg" && "w-[60px] h-[40px]",
				className,
			)}
		>
			<img
				src={`https://flagcdn.com/w${width}/${flagCode.toLowerCase()}.png`}
				alt={`${flagCode} flag`}
				className="w-full h-full object-cover"
				crossOrigin="anonymous"
			/>
		</div>
	);
}
