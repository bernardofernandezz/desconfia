import { expect, test } from "bun:test";
import { clientIp, isRateLimited } from "./rate-limit";

test("limits each key and bucket independently", async () => {
	const results = [];
	for (let attempt = 0; attempt < 6; attempt++) {
		results.push(await isRateLimited("verify", "203.0.113.1"));
	}

	expect(results).toEqual([false, false, false, false, false, true]);
	expect(await isRateLimited("verify", "203.0.113.2")).toBe(false);
	expect(await isRateLimited("feedback", "203.0.113.1")).toBe(false);
});

test("reads the client IP from the first forwarded address", () => {
	const request = new Request("http://localhost", {
		headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1" },
	});
	expect(clientIp(request)).toBe("203.0.113.9");
	expect(clientIp(new Request("http://localhost"))).toBe("local");
});
