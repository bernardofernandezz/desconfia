import { expect, test } from "bun:test";
import { createRateLimiter } from "./rate-limit";

test("limits each key independently within the window", () => {
	const isLimited = createRateLimiter({ max: 2, windowMs: 60_000 });
	expect([isLimited("a"), isLimited("a"), isLimited("a")]).toEqual([
		false,
		false,
		true,
	]);
	expect(isLimited("b")).toBe(false);
});
