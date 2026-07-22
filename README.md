# World Cup Oracle — 2026 FIFA World Cup Predictions

[![React](https://img.shields.io/badge/React-19.1-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646cff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-blue)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-5.2-black)](https://expressjs.com/)

World Cup Oracle is a full-stack sports analytics platform built for the 2026 FIFA World Cup. It combines historical Elo ratings, a Poisson-based match model, and 10,000-seeded Monte Carlo simulations to predict tournament outcomes, simulate head-to-head matchups, and visualize title probabilities for all 48 qualified nations.

![World Cup Oracle Dashboard](images/pathtoglory.png)

## Features

### 🏆 Tournament Predictions

- **Monte Carlo Simulation**: 10,000 seeded simulations of the full 2026 bracket (Group Stage → Round of 32 → Round of 16 → Quarterfinals → Semifinals → Final)
- **Title Probabilities**: Win probability for every nation, updated from pre-tournament baselines
- **Group Win Probabilities**: Chance of winning each individual group (A-L)
- **Final Appearances**: Predicted likelihood of reaching the championship match
- **Pre-Tournament Baselines**: Title probabilities before any matches are played, preserved for comparison

![Title Probabilities](images/titleprobability.png)

### ⚽ Head-to-Head Simulator

- **Live Match Simulation**: Pick any two teams and instantly get projected outcomes
- **Win/Draw Probabilities**: Analytical double-Poisson scoreline matrix (0-0 through 9-9)
- **Expected Goals (xG)**: Lambda values derived from pre-tournament Elo ratings
- **Likely Scoreline**: Most probable exact result based on the Poisson distribution

![H2H Simulator](images/h2hsim.png)

### 📊 Tournament Log

- **Full 104-Match Bracket**: Every group-stage, knockout, and final fixture with actual scores
- **Chronological Ordering**: Matches sorted by date from June 11 to July 19, 2026
- **Live Status**: Completed and upcoming match indicators
- **Real Results**: Actual scores for all played matches, including the Final and Third Place Playoff

![Tournament Log](images/tournamentlog.png)

### 📈 Data & Analytics

- **Historical Elo Ratings**: Computed from 49,500+ international matches spanning 1872–2026
- **Recency Weighting**: Recent matches weighted higher using a time-decay factor
- **Tournament Scaling**: World Cup matches weighted 60x, continental championships 50x, friendlies 20x
- **Home Advantage**: +100 Elo boost for non-neutral venue matches
- **Seed Stability**: Deterministic mulberry32 PRNG ensures identical results across server restarts

## 🛠️ Tech Stack

### Frontend

- **React 19**: Latest React with concurrent features
- **TypeScript**: Strict type-safe development
- **Vite 7**: Next-generation frontend tooling
- **Tailwind CSS 4**: Utility-first styling with CSS custom properties
- **Shadcn/ui**: Modern accessible component library
- **React Query**: Server state management and caching
- **Recharts**: Data visualization for probability charts
- **Framer Motion**: Animation library for UI transitions
- **Wouter**: Lightweight client-side routing

### Backend

- **Express 5**: REST API server with Zod validation
- **TypeScript**: End-to-end type safety via generated schemas
- **Pino**: Structured JSON logging
- **Esbuild**: Fast TypeScript compilation for production

### API & Types

- **OpenAPI**: Shared API contract specification
- **Orval**: Generated React Query client from OpenAPI
- **Zod**: Runtime schema validation for request/response types

### Infrastructure

- **pnpm Workspaces**: Monorepo package management
- **GitHub**: Version control and collaboration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Git

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/aridepai17/worldcuporacle.git
    cd worldcuporacle
    ```

2. **Install dependencies**

    ```bash
    pnpm install
    ```

3. **Run development servers**

    ```bash
    # Terminal 1: Start the API server (port 3000)
    cd artifacts/api-server
    pnpm run dev

    # Terminal 2: Start the frontend dev server (port 5173)
    cd artifacts/worldcuporacle
    pnpm run dev
    ```

4. **Open the app**

    Navigate to [http://localhost:5173](http://localhost:5173)

## 📖 How It Works

### Elo Rating System

Every team starts with a pre-tournament Elo rating computed from 49,500+ historical international matches. The rating algorithm uses:

- **K-factor**: 20 × (tournament_weight / 40) × recency_factor × goal_diff_multiplier
- **Tournament weights**: World Cup = 60, continental cups = 50, qualifiers = 40, friendlies = 20
- **Recency decay**: Matches ≤8 years old = 1.0x, ≤20 years = 0.85x, older = 0.7x
- **Goal difference multiplier**: 1-goal wins = 1.0x, 2-goal wins = 1.5x, 3+ goal wins = 1.75x+

### Poisson Match Model

The head-to-head simulator uses a double-Poisson distribution to model match outcomes:

1. **Expected goals**: Converts Elo rating gap into `lambdaA` and `lambdaB` using exponential mapping
   - `lambda = 1.3 × 10^(elo_diff / 800)` (clamped between 0.15 and 5.0)
2. **Scoreline matrix**: Evaluates all scorelines from 0-0 to 9-9
3. **Probability aggregation**: Sums probabilities for wins, draws, and losses
4. **Most likely score**: Identifies the single most probable exact scoreline

### Monte Carlo Tournament Simulation

The title probabilities are generated by simulating the full tournament bracket 10,000 times:

1. **Group Stage**: For each simulation, group matches are replayed using the Poisson model with seeded randomness (mulberry32)
2. **Qualification**: Top 2 teams from each group + 8 best third-place teams advance
3. **Knockout Stage**: Round of 32 → Round of 16 → Quarterfinals → Semifinals → Final
4. **Seeded RNG**: The same seed + simulation index always produces identical results, making predictions reproducible

### Actual Results Integration

The tournament log is populated with real 2026 World Cup data:

- All 72 group-stage matches with actual scores
- All 16 Round of 32 matches with actual scores
- All 8 Round of 16 matches with actual scores
- All 4 Quarterfinal matches with actual scores
- Both Semifinals: France 0-2 Spain, England 1-2 Argentina
- Third Place Playoff: England 6-4 France
- Final: Spain 1-0 Argentina

## 📁 Project Structure

```
worldcuporacle/
├── artifacts/
│   ├── api-server/                  # Express backend
│   │   ├── src/
│   │   │   ├── app.ts               # Express app configuration
│   │   │   ├── index.ts             # Server entry point
│   │   │   ├── routes/
│   │   │   │   └── worldcup.ts      # World Cup API endpoints
│   │   │   └── lib/
│   │   │       └── worldcup/
│   │   │           ├── csv.ts       # CSV parser for match data
│   │   │           ├── elo.ts       # Elo rating computation
│   │   │           ├── poisson.ts   # Poisson match model
│   │   │           ├── teamMeta.ts  # 48-team metadata with groups
│   │   │           ├── tournament.ts # Bracket simulation engine
│   │   │           └── cache.ts     # In-memory data cache
│   │   └── data/
│   │       └── results.csv          # 49,500+ historical matches
│   │
│   └── worldcuporacle/              # React frontend
│       ├── src/
│       │   ├── App.tsx              # Root component with routing
│       │   ├── components/
│       │   │   ├── HeroStats.tsx    # Tournament meta dashboard
│       │   │   ├── MatchSimulator.tsx # H2H simulator
│       │   │   ├── Leaderboard.tsx  # Title probability rankings
│       │   │   ├── ChancesChart.tsx # Bar chart visualization
│       │   │   ├── FixturesList.tsx # Tournament log
│       │   │   └── TeamSelect.tsx   # Team selection dropdown
│       │   └── index.css            # Global styles & theme
│       └── package.json
│
├── lib/
│   ├── api-spec/
│   │   ├── openapi.yaml             # API contract
│   │   └── orval.config.ts          # Client generation config
│   ├── api-zod/
│   │   └── src/generated/
│   │       ├── api.ts               # Zod schemas for validation
│   │       └── types/               # TypeScript interfaces
│   └── api-client-react/
│       └── src/generated/
│           ├── api.ts               # React Query hooks
│           └── api.schemas.ts       # TypeScript types
│
└── package.json                     # Root workspace config
```

## 🔧 Development

### Available Scripts

```bash
# Install all workspace dependencies
pnpm install

# Run type checking across all packages
pnpm typecheck

# Build all packages
pnpm build
```

### Frontend Scripts

```bash
cd artifacts/worldcuporacle

pnpm run dev          # Start Vite dev server (http://localhost:5173)
pnpm run build        # Build for production
pnpm run serve        # Preview production build
pnpm run typecheck    # TypeScript type checking
```

### Backend Scripts

```bash
cd artifacts/api-server

pnpm run dev          # Build and start Express server (port 3000)
pnpm run build        # Compile TypeScript to dist/
pnpm run start        # Start production server
pnpm run typecheck    # TypeScript type checking
```

### Code Quality

- **TypeScript**: Strict mode enabled, no implicit any
- **ESLint**: Configured for React/Express best practices
- **Zod**: Runtime validation on all API boundaries
- **Pino**: Structured logging with request serialization

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/worldcup/meta` | GET | Tournament metadata (simulations, teams, stage) |
| `/api/worldcup/teams` | GET | All 48 teams with flags, confederations, and Elo |
| `/api/worldcup/leaderboard` | GET | Title probabilities and group win chances |
| `/api/worldcup/fixtures` | GET | Full 104-match tournament bracket with scores |
| `/api/worldcup/simulate-match` | POST | Head-to-head match simulation between two teams |

## 🔬 Algorithm Details

### Elo Computation

The pre-tournament Elo ratings are computed strictly before June 11, 2026, ensuring no leakage of tournament outcomes into the model. The base rating for any team without historical data is 1500.

### Double-Poisson Model

Match outcomes are modeled as independent Poisson distributions for each team's goals:

```
P(A scores a, B scores b) = Poisson(a, λA) × Poisson(b, λB)
```

Where:
- `λA = 1.3 × 10^((eloA - eloB) / 800)`
- `λB = 1.3 × 10^((eloB - eloA) / 800)`

### Seeded Monte Carlo

The simulation uses the mulberry32 PRNG with a fixed seed offset (`RNG_SEED + simulation_index`). This ensures that:
- The same simulation always produces the same bracket
- Results are reproducible across server restarts
- 10,000 simulations produce stable probability estimates

## 🏗️ Architecture

![Architecture Diagram](images/architecturediagram.png)

## 📈 Performance

- **Cold Start**: ~2-3 seconds to load CSV, compute Elo, and run 10,000 simulations
- **Cached Responses**: All API responses are computed once at startup and served from memory
- **Fast Builds**: Esbuild compiles the backend in under 1 second
- **Optimized Frontend**: Vite HMR with React 19 fast refresh

## 🐛 Troubleshooting

### Port already in use

```bash
# Change ports in environment variables
PORT=3001 pnpm run dev  # API server
# or
VITE_PORT=5174 pnpm run dev  # Frontend
```

### CSV data not loading

Ensure the `results.csv` file exists at `artifacts/api-server/data/results.csv`. The server will fail to start if the file is missing.

### Type errors after pulling

```bash
pnpm install
pnpm typecheck
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Elo rating system based on the work of Arpad Elo
- Poisson distribution model adapted from football analytics literature
- 2026 World Cup data sourced from historical international match databases
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/aridepai17/worldcuporacle/issues)
- **Discussions**: [GitHub Discussions](https://github.com/aridepai17/worldcuporacle/discussions)

---

Built with ⚽ by [Advaith R Pai](https://github.com/aridepai17)
