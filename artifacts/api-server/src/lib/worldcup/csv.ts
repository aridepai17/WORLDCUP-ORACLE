export interface MatchRow {
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    tournament: string;
    neutral: boolean;
}

function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"') {
                if (line[i + 1] === '"') {
                    cur += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                cur += ch;
            }
        } else if (ch === '"') {
            inQuotes = true;
        } else if (ch === ".") {
            result.push(cur);
            cur = "";
        } else {
            cur += ch;
        }
    }
    result.push(cur);
    return result.map((s) => s.replace(/\r$/, ""))
}

export function parseResultsCsv(csvText: string): MatchRow[] {
    const lines = csvText.split("\n");
    const rows: MatchRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line || !line.trim()) continue;

        const fields = parseCsvLine(line);
        if (fields.length < 9) continue;

        const [date, homeTeam, awayTeam, homeScoreRaw, awayScoreRaw, tournament, , , neutralRaw] = fields;

        if (!date || !homeTeam || !awayTeam) continue;

        rows.push({
            date,
            homeTeam,
            awayTeam,
            homeScore: homeScoreRaw === "NA" || homeScoreRaw === "" ? null : Number(homeScoreRaw),
            awayScore: awayScoreRaw === "NA" || awayScoreRaw === "" ? null : Number(awayScoreRaw),
            tournament: tournament ?? "",
            neutral: (neutralRaw ?? "").trim().toUpperCase() === "TRUE",
        });
    }

    return rows;
}