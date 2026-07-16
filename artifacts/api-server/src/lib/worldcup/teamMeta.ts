export interface TeamMeta {
	name: string;
	code: string;
	flagCode: string;
	confederation: string;
}

// The 48 nations that qualified for the 2026 FIFA World Cup.
export const TEAM_META: TeamMeta[] = [
	{ name: "Algeria", code: "ALG", flagCode: "dz", confederation: "CAF" },
	{
		name: "Argentina",
		code: "ARG",
		flagCode: "ar",
		confederation: "CONMEBOL",
	},
	{ name: "Australia", code: "AUS", flagCode: "au", confederation: "AFC" },
	{ name: "Austria", code: "AUT", flagCode: "at", confederation: "UEFA" },
	{ name: "Belgium", code: "BEL", flagCode: "be", confederation: "UEFA" },
	{
		name: "Bosnia and Herzegovina",
		code: "BIH",
		flagCode: "ba",
		confederation: "UEFA",
	},
	{ name: "Brazil", code: "BRA", flagCode: "br", confederation: "CONMEBOL" },
	{ name: "Canada", code: "CAN", flagCode: "ca", confederation: "CONCACAF" },
	{ name: "Cape Verde", code: "CPV", flagCode: "cv", confederation: "CAF" },
	{
		name: "Colombia",
		code: "COL",
		flagCode: "co",
		confederation: "CONMEBOL",
	},
	{ name: "Croatia", code: "CRO", flagCode: "hr", confederation: "UEFA" },
	{ name: "Curaçao", code: "CUW", flagCode: "cw", confederation: "CONCACAF" },
	{
		name: "Czech Republic",
		code: "CZE",
		flagCode: "cz",
		confederation: "UEFA",
	},
	{ name: "DR Congo", code: "COD", flagCode: "cd", confederation: "CAF" },
	{ name: "Ecuador", code: "ECU", flagCode: "ec", confederation: "CONMEBOL" },
	{ name: "Egypt", code: "EGY", flagCode: "eg", confederation: "CAF" },
	{ name: "England", code: "ENG", flagCode: "gb-eng", confederation: "UEFA" },
	{ name: "France", code: "FRA", flagCode: "fr", confederation: "UEFA" },
	{ name: "Germany", code: "GER", flagCode: "de", confederation: "UEFA" },
	{ name: "Ghana", code: "GHA", flagCode: "gh", confederation: "CAF" },
	{ name: "Haiti", code: "HAI", flagCode: "ht", confederation: "CONCACAF" },
	{ name: "Iran", code: "IRN", flagCode: "ir", confederation: "AFC" },
	{ name: "Iraq", code: "IRQ", flagCode: "iq", confederation: "AFC" },
	{ name: "Ivory Coast", code: "CIV", flagCode: "ci", confederation: "CAF" },
	{ name: "Japan", code: "JPN", flagCode: "jp", confederation: "AFC" },
	{ name: "Jordan", code: "JOR", flagCode: "jo", confederation: "AFC" },
	{ name: "Mexico", code: "MEX", flagCode: "mx", confederation: "CONCACAF" },
	{ name: "Morocco", code: "MAR", flagCode: "ma", confederation: "CAF" },
	{ name: "Netherlands", code: "NED", flagCode: "nl", confederation: "UEFA" },
	{ name: "New Zealand", code: "NZL", flagCode: "nz", confederation: "OFC" },
	{ name: "Norway", code: "NOR", flagCode: "no", confederation: "UEFA" },
	{ name: "Panama", code: "PAN", flagCode: "pa", confederation: "CONCACAF" },
	{
		name: "Paraguay",
		code: "PAR",
		flagCode: "py",
		confederation: "CONMEBOL",
	},
	{ name: "Portugal", code: "POR", flagCode: "pt", confederation: "UEFA" },
	{ name: "Qatar", code: "QAT", flagCode: "qa", confederation: "AFC" },
	{ name: "Saudi Arabia", code: "KSA", flagCode: "sa", confederation: "AFC" },
	{
		name: "Scotland",
		code: "SCO",
		flagCode: "gb-sct",
		confederation: "UEFA",
	},
	{ name: "Senegal", code: "SEN", flagCode: "sn", confederation: "CAF" },
	{ name: "South Africa", code: "RSA", flagCode: "za", confederation: "CAF" },
	{ name: "South Korea", code: "KOR", flagCode: "kr", confederation: "AFC" },
	{ name: "Spain", code: "ESP", flagCode: "es", confederation: "UEFA" },
	{ name: "Sweden", code: "SWE", flagCode: "se", confederation: "UEFA" },
	{ name: "Switzerland", code: "SUI", flagCode: "ch", confederation: "UEFA" },
	{ name: "Tunisia", code: "TUN", flagCode: "tn", confederation: "CAF" },
	{ name: "Turkey", code: "TUR", flagCode: "tr", confederation: "UEFA" },
	{
		name: "United States",
		code: "USA",
		flagCode: "us",
		confederation: "CONCACAF",
	},
	{ name: "Uruguay", code: "URU", flagCode: "uy", confederation: "CONMEBOL" },
	{ name: "Uzbekistan", code: "UZB", flagCode: "uz", confederation: "AFC" },
];

export const TEAM_META_BY_NAME = new Map(TEAM_META.map((t) => [t.name, t]));
export const TEAM_META_BY_CODE = new Map(TEAM_META.map((t) => [t.code, t]));
