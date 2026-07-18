const MAX_GOALS = 9;
const AVG_GOALS = 1.3;
const NEUTRAL_BOOST = 0; // both teams treated as neutral by default (World Cup, single host)
const NON_NEUTRAL_BOOST = 0.12;

const factorialCache: number[] = [1];
function factorial(n : number): number {
    for (let i = factorialCache.length; i <= n; i++) {
        factorialCache[i] = factorialCache[i - 1] * i;
    }
    return factorialCache[n];
}

export function poissonPmf(k: number, lambda: number): number {
    return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

export interface ExpectedGoals {
    lambdaA: number;
    lambdaB: number;
}

// Converts Elo rating gap into a pair of expected-goal rates via a calibrated exponential mapping
export function expectedGoals(eloA: number, eloB: number, neutral = true): ExpectedGoals {
    const boost = neutral ? NEUTRAL_BOOST : NON_NEUTRAL_BOOST;
    const diff = eloA - eloB;
    let lambdaA = AVG_GOALS * Math.pow(10, diff / 800) + boost;
    let lambdaB = AVG_GOALS * Math.pow(10, -diff / 800);
    lambdaA = Math.min(Math.max(lambdaA, 0.15), 5);
    lambdaB = Math.min(Math.max(lambdaB, 0.15), 5);
    return { lambdaA, lambdaB };
}

export interface MatchModel {
    lambdaA: number;
    lambdaB: number;
    pWinA: number;
    pDraw: number;
    pWinB: number;
    likelyA: number;
    likelyB: number;
}

// Full analytical double-Poisson scoreline matrix, used both for the live simulate-match endpoint and precompute
export function computeMatchModel(eloA: number, eloB: number, neutral = true): MatchModel {
    const { lambdaA, lambdaB } = expectedGoals(eloA, eloB, neutral);

    let pWinA = 0;
    let pDraw = 0;
    let pWinB = 0;
    let best = { a: 0, b: 0, p: -1 };

    for (let a = 0; a <= MAX_GOALS; a++) {
        for (let b = 0; b <= MAX_GOALS; b++) {
            const p = poissonPmf(a, lambdaA) * poissonPmf(b, lambdaB);
            if (a > b) pWinA += p;
            else if (a < b) pWinB += p;
            else pDraw += p;
            if (p > best.p) best = { a, b, p };
        }
    }

    const total = pWinA + pDraw + pWinB;

    return {
        lambdaA,
        lambdaB,
        pWinA: pWinA / total,
        pDraw: pDraw / total,
        pWinB: pWinB / total,
        likelyA: best.a,
        likelyB: best.b,
    };
}

// Detrministic PRNG (mulberry32) so Monte Carlo results are stable across server restarts
export function mulberry32(seed: number): () => number {
    let state = seed;
    return function rng() {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function samplePoisson(lambda: number, rng: () => number): number {
    const limit = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
        k++;
        p *= rng();
    } while (p > limit);
    return k - 1;
}