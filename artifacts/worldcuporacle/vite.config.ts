import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const basePath = process.env.BASE_PATH || "/";
const port = Number(process.env.PORT) || 5173;

export default defineConfig({
	base: basePath,
	plugins: [
		react(),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			"@assets": path.resolve(
				__dirname,
				"..",
				"..",
				"attached_assets",
			),
		},
		dedupe: ["react", "react-dom"],
	},
	root: path.resolve(__dirname),
	build: {
		outDir: path.resolve(__dirname, "dist/public"),
		emptyOutDir: true,
	},
	server: {
		port,
		strictPort: true,
		host: "0.0.0.0",
		allowedHosts: true,
		fs: {
			strict: true,
		},
	},
	preview: {
		port,
		host: "0.0.0.0",
		allowedHosts: true,
	},
});
