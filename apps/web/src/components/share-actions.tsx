"use client";

import { Button } from "@desconfia/ui/components/button";
import { ClipboardCopy, Link2, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ShareActionsProps = { title: string; text: string };

async function copy(value: string, successMessage: string) {
	try {
		await navigator.clipboard.writeText(value);
		toast.success(successMessage);
	} catch {
		toast.error("Não foi possível copiar. Selecione o texto manualmente.");
	}
}

export function ShareActions({ title, text }: ShareActionsProps) {
	const [canShare, setCanShare] = useState(false);

	useEffect(() => setCanShare(typeof navigator.share === "function"), []);

	const url = () => window.location.href;
	const fullText = () => `${text}\n\nRelatório completo: ${url()}`;

	function sendToWhatsApp() {
		const href = `https://wa.me/?text=${encodeURIComponent(fullText())}`;
		window.open(href, "_blank", "noopener,noreferrer");
	}

	async function share() {
		try {
			await navigator.share({ title, url: url() });
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") return;
			copy(url(), "Link copiado");
		}
	}

	return (
		<div className="flex flex-wrap gap-2 print:hidden">
			<Button onClick={sendToWhatsApp} className="h-9 rounded-lg px-3 text-sm">
				<MessageCircle aria-hidden />
				Enviar no WhatsApp
			</Button>
			<Button
				variant="outline"
				onClick={() => copy(fullText(), "Resumo copiado")}
				className="h-9 rounded-lg px-3 text-sm"
			>
				<ClipboardCopy aria-hidden />
				Copiar resumo
			</Button>
			<Button
				variant="outline"
				onClick={() => copy(url(), "Link copiado")}
				className="h-9 rounded-lg px-3 text-sm"
			>
				<Link2 aria-hidden />
				Copiar link
			</Button>
			{canShare ? (
				<Button
					variant="outline"
					size="icon"
					onClick={share}
					className="size-9 rounded-lg"
				>
					<Share2 aria-hidden />
					<span className="sr-only">Mais opções de compartilhamento</span>
				</Button>
			) : null}
		</div>
	);
}
