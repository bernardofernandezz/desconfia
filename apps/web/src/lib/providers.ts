import { ENV } from "@/env.server";

export const isLiveResearchEnabled = () =>
	Boolean(ENV.TAVILY_API_KEY && ENV.GOOGLE_GENERATIVE_AI_API_KEY);
