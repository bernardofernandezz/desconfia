import type { Verdict } from "./report";

// Everything here lives only in this browser: there is no account and no server-side history.
const HISTORY_KEY = "desconfia:history";
const TOKENS_KEY = "desconfia:delete-tokens";
const MAX_HISTORY = 20;

export type RecentReport = {
	id: string;
	claim: string;
	verdict: Verdict;
	researchedAt: string;
};

function read<T>(key: string, fallback: T): T {
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
}

function write(key: string, value: unknown) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Private mode or full storage: history is a convenience, so ignore it.
	}
}

export function getRecentReports() {
	const history = read<RecentReport[]>(HISTORY_KEY, []);
	return Array.isArray(history) ? history : [];
}

export function rememberReport(entry: RecentReport) {
	const others = getRecentReports().filter((report) => report.id !== entry.id);
	write(HISTORY_KEY, [entry, ...others].slice(0, MAX_HISTORY));
}

export function clearRecentReports() {
	write(HISTORY_KEY, []);
}

export function saveDeleteToken(reportIds: string[], token: string) {
	const tokens = read<Record<string, string>>(TOKENS_KEY, {});
	for (const id of reportIds) tokens[id] = token;
	write(TOKENS_KEY, tokens);
}

export function getDeleteToken(reportId: string) {
	return read<Record<string, string>>(TOKENS_KEY, {})[reportId] ?? null;
}

export function forgetReport(reportId: string) {
	write(
		HISTORY_KEY,
		getRecentReports().filter((report) => report.id !== reportId),
	);
	const { [reportId]: _removed, ...tokens } = read<Record<string, string>>(
		TOKENS_KEY,
		{},
	);
	write(TOKENS_KEY, tokens);
}
