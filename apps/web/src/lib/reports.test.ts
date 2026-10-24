import { expect, test } from "bun:test";
import { examples } from "./examples";
import {
	createDeleteToken,
	getFeaturedReports,
	isFeatured,
	saveReport,
	setFeatured,
} from "./reports";

test("only reports picked by an editor are featured", async () => {
	const [first, second] = examples.map(({ report }) => report);
	if (!first || !second) throw new Error("examples missing");
	const firstId = await saveReport(first, createDeleteToken());
	const secondId = await saveReport(second, createDeleteToken());

	expect(await isFeatured(firstId)).toBe(false);
	expect(await setFeatured(firstId, true)).toBe(true);
	expect(await setFeatured("missing", true)).toBe(false);

	expect(await isFeatured(firstId)).toBe(true);
	expect(await isFeatured(secondId)).toBe(false);
	expect((await getFeaturedReports()).map(({ id }) => id)).toContain(firstId);

	await setFeatured(firstId, false);
	expect(await isFeatured(firstId)).toBe(false);
});
