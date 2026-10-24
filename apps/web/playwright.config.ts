import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	reporter: process.env.CI ? "github" : "list",
	use: {
		baseURL: `http://localhost:${PORT}`,
		launchOptions: { executablePath: process.env.CHROMIUM_PATH },
	},
	projects: [
		{ name: "desktop", use: { ...devices["Desktop Chrome"] } },
		{ name: "mobile", use: { ...devices["Pixel 7"] } },
	],
	// Runs the production build without provider keys, so the app is in demo mode.
	webServer: {
		command: `bunx next start -p ${PORT}`,
		port: PORT,
		reuseExistingServer: !process.env.CI,
		env: { TAVILY_API_KEY: "", GOOGLE_GENERATIVE_AI_API_KEY: "" },
	},
});
