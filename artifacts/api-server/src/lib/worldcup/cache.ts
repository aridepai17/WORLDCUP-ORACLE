import fs from "node:fs";
import path from "node:path";
import { buildWorldCupData, type WorldCupData } from "./tournament";

let cached: WorldCupData | null = null;

export function getWorldCupData(): WorldCupData {
    if (cached) return cached;

    const csvPath = path.resolve(__dirname, "../data/results.csv");
    const csvText = fs.readFileSync(csvPath, "utf8");
    cached = buildWorldCupData(csvText);
    return cached;
}