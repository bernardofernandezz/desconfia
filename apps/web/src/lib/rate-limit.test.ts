import { expect, test } from "bun:test";
import { isRateLimited } from "./rate-limit";

const requestFrom = (ip: string) =>
	new Request("http://localhost/api/verify", {
		headers: { "x-forwarded-for": ip },
	});

test("limits each client and bucket independently", async () => {
	const results = [];
	for (let attempt = 0; attempt < 6; attempt++) {
		results.push(await isRateLimited(requestFrom("203.0.113.1"), "verify"));
	}

	expect(results).toEqual([false, false, false, false, false, true]);
	expect(await isRateLimited(requestFrom("203.0.113.2"), "verify")).toBe(false);
	expect(await isRateLimited(requestFrom("203.0.113.1"), "feedback")).toBe(
		false,
	);
});
