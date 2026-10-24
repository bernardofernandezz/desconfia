import { beforeEach, describe, expect, mock, test } from "bun:test";
import "@/test/mock-research";

const sent: string[] = [];
let downloaded: Uint8Array | null = null;

const whatsapp = await import("./whatsapp");
mock.module("./whatsapp", () => ({
	...whatsapp,
	sendText: async (_config: unknown, _to: string, body: string) => {
		sent.push(body);
	},
	downloadMedia: async () => downloaded,
}));

const { handleMessage } = await import("./whatsapp-bot");

const config = {
	accessToken: "token",
	phoneNumberId: "123",
	appSecret: "secret",
	verifyToken: "verify",
};
let sender = 0;
const nextSender = () => `55119${++sender}`;

beforeEach(() => {
	sent.length = 0;
	downloaded = null;
});

describe("handleMessage", () => {
	test("explains what to send for unsupported or too short messages", async () => {
		await handleMessage(config, { from: nextSender(), kind: "unsupported" });
		await handleMessage(config, {
			from: nextSender(),
			kind: "text",
			text: "oi",
		});

		expect(sent).toHaveLength(2);
		for (const reply of sent)
			expect(reply).toContain("Envie o texto, o link ou o print");
	});

	test("acknowledges, verifies and replies with the verdict and link", async () => {
		await handleMessage(config, {
			from: nextSender(),
			kind: "text",
			text: "O Congresso aprovou uma nova lei de proteção de dados",
		});

		expect(sent[0]).toContain("Recebi!");
		expect(sent[1]).toContain("*Confirmado*");
		expect(sent[1]).toMatch(
			/Relatório completo: http:\/\/localhost:3001\/r\/\w+/,
		);
	});

	test("groups long chains into one reply", async () => {
		await handleMessage(config, {
			from: nextSender(),
			kind: "text",
			text: "Corrente de WhatsApp com várias alegações políticas. ".repeat(8),
		});

		expect(sent[1]).toStartWith("Encontrei 2 alegações nessa mensagem:");
		expect(sent[1]).toMatch(
			/Relatórios completos: http:\/\/localhost:3001\/g\/\w+/,
		);
	});

	test("rejects images that are too big or not really images", async () => {
		await handleMessage(config, {
			from: nextSender(),
			kind: "image",
			mediaId: "big",
		});
		downloaded = new TextEncoder().encode("<svg/>");
		await handleMessage(config, {
			from: nextSender(),
			kind: "image",
			mediaId: "svg",
		});

		expect(sent).toEqual([
			"A imagem pode ter no máximo 5 MB.",
			"Envie uma imagem PNG, JPEG ou WebP.",
		]);
	});

	test("stops verifying after too many messages from the same number", async () => {
		const from = nextSender();
		for (let message = 0; message < 10; message++) {
			await handleMessage(config, { from, kind: "unsupported" });
		}
		sent.length = 0;
		for (let message = 0; message < 11; message++) {
			await handleMessage(config, {
				from,
				kind: "text",
				text: "O Congresso aprovou uma nova lei de proteção de dados",
			});
		}

		expect(sent.at(-1)).toContain("muitas verificações");
	});
});
