import { expect, test } from "@playwright/test";

const claimField = (page: import("@playwright/test").Page) =>
	page.getByLabel("Alegação ou link da notícia");

test("opens an example report from the landing page", async ({ page }) => {
	await page.goto("/");
	await page
		.getByRole("link", { name: /Ver relatório/ })
		.first()
		.click();

	await expect(page.getByText("Exemplo ilustrativo.")).toBeVisible();
	await expect(
		page.getByRole("heading", { name: "Fontes consultadas" }),
	).toBeVisible();
	await expect(
		page.locator('a[href^="https://www.lexml.gov.br"]').first(),
	).toBeVisible();
});

test("validates the claim before sending it", async ({ page }) => {
	await page.goto("/");
	await claimField(page).fill("curto");
	await page.getByRole("button", { name: "Verificar" }).click();

	await expect(
		page.getByText("Descreva a alegação com pelo menos 10 caracteres."),
	).toBeVisible();
	await expect(claimField(page)).toHaveAttribute("aria-invalid", "true");
});

test("explains demo mode when no provider is configured", async ({ page }) => {
	await page.goto("/");
	await claimField(page).fill("O governo criou um imposto sobre o PIX");
	await page.getByRole("button", { name: "Verificar" }).click();

	const alert = page
		.getByRole("alert")
		.filter({ hasText: "Modo demonstração" });
	await expect(alert).toBeVisible();
	await expect(alert).toBeFocused();
});

test("cancels a running verification", async ({ page }) => {
	await page.route("**/api/verify", () => new Promise(() => {}));
	await page.goto("/");
	await claimField(page).fill("O governo criou um imposto sobre o PIX");
	await page.getByRole("button", { name: "Verificar" }).click();

	const progress = page.getByRole("heading", { name: "Pesquisa em andamento" });
	await expect(progress).toBeVisible();
	await page.getByRole("button", { name: "Cancelar" }).click();
	await expect(progress).toBeHidden();
	await expect(claimField(page)).toBeEnabled();
});

test("copies a ready-to-share summary", async ({
	page,
	context,
	browserName,
}) => {
	test.skip(
		browserName !== "chromium",
		"clipboard permissions are Chromium-only",
	);
	await context.grantPermissions(["clipboard-read", "clipboard-write"]);
	await page.goto("/exemplos/data-das-eleicoes");
	await page.getByRole("button", { name: "Copiar resumo" }).click();

	const copied = await page.evaluate(() => navigator.clipboard.readText());
	expect(copied).toContain("*Confirmado*");
	expect(copied).toContain("/exemplos/data-das-eleicoes");
});

test("serves link previews for reports", async ({ request }) => {
	const response = await request.get(
		"/exemplos/data-das-eleicoes/opengraph-image",
	);
	expect(response.ok()).toBe(true);
	expect(response.headers()["content-type"]).toBe("image/png");
});

test("returns 404 for unknown reports", async ({ page }) => {
	const response = await page.goto("/r/naoexiste0000");
	expect(response?.status()).toBe(404);
	await expect(page.getByText("Página não encontrada")).toBeVisible();
});

test("navigates with the mobile menu", async ({ page, isMobile }) => {
	test.skip(!isMobile, "the menu only exists on small screens");
	await page.goto("/");
	await page.getByRole("button", { name: "Abrir menu" }).click();
	await page.getByRole("menuitem", { name: "Sobre" }).click();
	await expect(page).toHaveURL(/\/sobre$/);
});
