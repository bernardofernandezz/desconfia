import { APICallError, RetryError } from "ai";

export type ResearchErrorCode =
	| "timeout"
	| "rate_limit"
	| "provider"
	| "no_content"
	| "not_found";

export class ResearchError extends Error {
	constructor(
		readonly code: ResearchErrorCode,
		message: string,
	) {
		super(message);
	}
}

export function toResearchError(error: unknown): ResearchError {
	if (error instanceof ResearchError) return error;

	const cause = RetryError.isInstance(error) ? error.lastError : error;
	if (
		cause instanceof DOMException &&
		(cause.name === "TimeoutError" || cause.name === "AbortError")
	) {
		return new ResearchError(
			"timeout",
			"A pesquisa demorou mais que o esperado.",
		);
	}
	if (APICallError.isInstance(cause) && cause.statusCode === 429) {
		return new ResearchError(
			"rate_limit",
			"O limite de uso do provedor de IA foi atingido. Tente novamente em alguns minutos.",
		);
	}
	return new ResearchError("provider", "O provedor de IA retornou um erro.");
}
