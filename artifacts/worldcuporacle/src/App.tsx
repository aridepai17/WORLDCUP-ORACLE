import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router as WouterRouter } from "wouter";

import { HeroStats } from "@/components/HeroStats";
import { MatchSimulator } from "@/components/MatchSimulator";
import { Leaderboard } from "@/components/Leaderboard";
import { ChancesChart } from "@/components/ChancesChart";
import { FixturesList } from "@/components/FixturesList";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			staleTime: 5 * 60 * 1000, // 5 mins
		},
	},
});

function Home() {
	return (
		<div className="min-h-screen bg-background text-foreground pb-12 sm:pb-20 relative overflow-x-hidden">
			{/* Background ambient noise/glows */}
			<div className="fixed inset-0 pointer-events-none z-0">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]"></div>
				<div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
			</div>

			<div className="container mx-auto max-w-4xl px-3 sm:px-4 pt-4 sm:pt-8 relative z-10 flex flex-col gap-4 sm:gap-6">
				{/* Header / Meta */}
				<section>
					<HeroStats />
				</section>

				{/* Stacked single-column feed: H2H simulator first, then each panel underneath */}
				<MatchSimulator />
				<Leaderboard />
				<ChancesChart />
				<FixturesList />
			</div>
		</div>
	);
}

function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background text-foreground">
			<div className="text-center">
				<h1 className="text-4xl font-black font-mono text-primary mb-2">
					404
				</h1>
				<p className="text-muted-foreground uppercase tracking-widest">
					Signal Lost
				</p>
			</div>
		</div>
	);
}

function Router() {
	return (
		<Switch>
			<Route path="/" component={Home} />
			<Route component={NotFound} />
		</Switch>
	);
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<WouterRouter
					base={import.meta.env.BASE_URL.replace(/\/$/, "")}
				>
					<Router />
				</WouterRouter>
				<Toaster />
			</TooltipProvider>
		</QueryClientProvider>
	);
}

export default App;
