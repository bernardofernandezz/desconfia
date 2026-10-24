import { deleteReport } from "@/lib/reports";

export async function DELETE(
	request: Request,
	ctx: RouteContext<"/api/reports/[id]">,
) {
	const { id } = await ctx.params;
	const token = request.headers.get("x-delete-token");
	if (!token) return new Response(null, { status: 401 });

	const deleted = await deleteReport(id, token);
	return new Response(null, { status: deleted ? 204 : 403 });
}
