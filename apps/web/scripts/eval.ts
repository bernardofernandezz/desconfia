import "varlock/auto-load";
import { isLiveResearchEnabled } from "@/lib/providers";
import type { Verdict } from "@/lib/report";
import { researchClaim } from "@/lib/research";
import cases from "../evals/claims.json";

type Outcome = Verdict | "erro";

const CLAIM_TIMEOUT_MS = 120_000;
const opposite: Partial<Record<Verdict, Verdict>> = {
	supported: "contradicted",
	contradicted: "supported",
};

if (!isLiveResearchEnabled()) {
	console.error(
		"Defina TAVILY_API_KEY e GOOGLE_GENERATIVE_AI_API_KEY para rodar a avaliação.",
	);
	process.exit(1);
}

const results: { claim: string; expected: Verdict; got: Outcome }[] = [];

// Sequential on purpose: the free provider tiers rate limit parallel calls.
for (const { claim, expected } of cases as {
	claim: string;
	expected: Verdict;
}[]) {
	let got: Outcome;
	try {
		const report = await researchClaim(
			claim,
			{ inputUrl: null },
			AbortSignal.timeout(CLAIM_TIMEOUT_MS),
			() => {},
		);
		got = report.verdict;
	} catch {
		got = "erro";
	}
	results.push({ claim, expected, got });
	console.log(`${got === expected ? "✓" : "✗"} ${got.padEnd(12)} ${claim}`);
}

const correct = results.filter((result) => result.got === result.expected);
const inconclusive = results.filter((result) => result.got === "inconclusive");
const inverted = results.filter(
	(result) => result.got === opposite[result.expected],
);
const failed = results.filter((result) => result.got === "erro");

console.log(
	`\nAcertos: ${correct.length}/${results.length} · inconclusivos: ${inconclusive.length} · invertidos: ${inverted.length} · erros: ${failed.length}`,
);

// An inconclusive answer is acceptable; confidently stating the opposite (or crashing) is not.
if (inverted.length > 0 || failed.length > 0) process.exit(1);
