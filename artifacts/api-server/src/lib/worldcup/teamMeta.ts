export interface TeamMeta {
	name: string;
	code: string;
	flagCode: string;
	confederation: string;
	group: string;
}

export const TEAM_META: TeamMeta[] = [
	{ name: "Algeria", code: "ALG", flagCode: "dz", confederation: "CAF", group: "J" },
	{ name: "Argentina", code: "ARG", flagCode: "ar", confederation: "CONMEBOL", group: "J" },
	{ name: "Australia", code: "AUS", flagCode: "au", confederation: "AFC", group: "D" },
	{ name: "Austria", code: "AUT", flagCode: "at", confederation: "UEFA", group: "J" },
	{ name: "Belgium", code: "BEL", flagCode: "be", confederation: "UEFA", group: "G" },
	{ name: "Bosnia and Herzegovina", code: "BIH", flagCode: "ba", confederation: "UEFA", group: "B" },
	{ name: "Brazil", code: "BRA", flagCode: "br", confederation: "CONMEBOL", group: "C" },
	{ name: "Canada", code: "CAN", flagCode: "ca", confederation: "CONCACAF", group: "B" },
	{ name: "Cape Verde", code: "CPV", flagCode: "cv", confederation: "CAF", group: "H" },
	{ name: "Colombia", code: "COL", flagCode: "co", confederation: "CONMEBOL", group: "K" },
	{ name: "Croatia", code: "CRO", flagCode: "hr", confederation: "UEFA", group: "L" },
	{ name: "Curaçao", code: "CUW", flagCode: "cw", confederation: "CONCACAF", group: "E" },
	{ name: "Czech Republic", code: "CZE", flagCode: "cz", confederation: "UEFA", group: "A" },
	{ name: "DR Congo", code: "COD", flagCode: "cd", confederation: "CAF", group: "K" },
	{ name: "Ecuador", code: "ECU", flagCode: "ec", confederation: "CONMEBOL", group: "E" },
	{ name: "Egypt", code: "EGY", flagCode: "eg", confederation: "CAF", group: "G" },
	{ name: "England", code: "ENG", flagCode: "gb-eng", confederation: "UEFA", group: "L" },
	{ name: "France", code: "FRA", flagCode: "fr", confederation: "UEFA", group: "I" },
	{ name: "Germany", code: "GER", flagCode: "de", confederation: "UEFA", group: "E" },
	{ name: "Ghana", code: "GHA", flagCode: "gh", confederation: "CAF", group: "L" },
	{ name: "Haiti", code: "HAI", flagCode: "ht", confederation: "CONCACAF", group: "C" },
	{ name: "Iran", code: "IRN", flagCode: "ir", confederation: "AFC", group: "G" },
	{ name: "Iraq", code: "IRQ", flagCode: "iq", confederation: "AFC", group: "I" },
	{ name: "Ivory Coast", code: "CIV", flagCode: "ci", confederation: "CAF", group: "E" },
	{ name: "Japan", code: "JPN", flagCode: "jp", confederation: "AFC", group: "F" },
	{ name: "Jordan", code: "JOR", flagCode: "jo", confederation: "AFC", group: "J" },
	{ name: "Mexico", code: "MEX", flagCode: "mx", confederation: "CONCACAF", group: "A" },
	{ name: "Morocco", code: "MAR", flagCode: "ma", confederation: "CAF", group: "C" },
	{ name: "Netherlands", code: "NED", flagCode: "nl", confederation: "UEFA", group: "F" },
	{ name: "New Zealand", code: "NZL", flagCode: "nz", confederation: "OFC", group: "G" },
	{ name: "Norway", code: "NOR", flagCode: "no", confederation: "UEFA", group: "I" },
	{ name: "Panama", code: "PAN", flagCode: "pa", confederation: "CONCACAF", group: "L" },
	{ name: "Paraguay", code: "PAR", flagCode: "py", confederation: "CONMEBOL", group: "D" },
	{ name: "Portugal", code: "POR", flagCode: "pt", confederation: "UEFA", group: "K" },
	{ name: "Qatar", code: "QAT", flagCode: "qa", confederation: "AFC", group: "B" },
	{ name: "Saudi Arabia", code: "KSA", flagCode: "sa", confederation: "AFC", group: "H" },
	{ name: "Scotland", code: "SCO", flagCode: "gb-sct", confederation: "UEFA", group: "C" },
	{ name: "Senegal", code: "SEN", flagCode: "sn", confederation: "CAF", group: "I" },
	{ name: "South Africa", code: "RSA", flagCode: "za", confederation: "CAF", group: "A" },
	{ name: "South Korea", code: "KOR", flagCode: "kr", confederation: "AFC", group: "A" },
	{ name: "Spain", code: "ESP", flagCode: "es", confederation: "UEFA", group: "H" },
	{ name: "Sweden", code: "SWE", flagCode: "se", confederation: "UEFA", group: "F" },
	{ name: "Switzerland", code: "SUI", flagCode: "ch", confederation: "UEFA", group: "B" },
	{ name: "Tunisia", code: "TUN", flagCode: "tn", confederation: "CAF", group: "F" },
	{ name: "Turkey", code: "TUR", flagCode: "tr", confederation: "UEFA", group: "D" },
	{ name: "United States", code: "USA", flagCode: "us", confederation: "CONCACAF", group: "D" },
	{ name: "Uruguay", code: "URU", flagCode: "uy", confederation: "CONMEBOL", group: "H" },
	{ name: "Uzbekistan", code: "UZB", flagCode: "uz", confederation: "AFC", group: "K" },
];

export const TEAM_META_BY_NAME = new Map(TEAM_META.map((t) => [t.name, t]));
export const TEAM_META_BY_CODE = new Map(TEAM_META.map((t) => [t.code, t]));
