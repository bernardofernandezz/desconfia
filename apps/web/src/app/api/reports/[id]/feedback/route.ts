import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limit";
import { getReport, saveFeedback } from "@/lib/reports";

const feedbackSchema = z.object({
	kind: z.enum(["wrong_verdict", "bad_source", "other"]),
	comment: z.string().trim().max(1000).optional(),
});

export async function POST(
	request: Request,
	ctx: RouteContext<"/api/reports/[id]/feedback">,
) {
	const parsed = feedbackSchema.safeParse(
		await request.json().catch(() => null),
	);
	if (!parsed.success) {
		return Response.json({ message: "Dados inválidos." }, { status: 400 });
	}
	if (await isRateLimited(request, "feedback")) {
		return Response.json(
			{ message: "Muitos envios seguidos. Tente mais tarde." },
			{ status: 429 },
		);
	}

	const { id } = await ctx.params;
	if (!(await getReport(id))) return new Response(null, { status: 404 });

	await saveFeedback(id, parsed.data.kind, parsed.data.comment || null);
	return new Response(null, { status: 201 });
}
