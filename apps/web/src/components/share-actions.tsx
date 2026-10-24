"use client";

import { Button } from "@desconfia/ui/components/button";
import { Link2, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ShareActions({ title }: { title: string }) {
	const [canShare, setCanShare] = useState(false);

	useEffect(() => setCanShare(typeof navigator.share === "function"), []);

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(window.location.href);
			toast.success("Link copiado");
		} catch {
			toast.error(
				"Não foi possível copiar. Copie o endereço na barra do navegador.",
			);
		}
	}

	async function share() {
		try {
			await navigator.share({ title, url: window.location.href });
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") return;
			copyLink();
		}
	}

	return (
		<div className="flex gap-2">
			<Button
				variant="outline"
				onClick={copyLink}
				className="h-9 rounded-lg px-3 text-sm"
			>
				<Link2 aria-hidden />
				Copiar link
			</Button>
			{canShare ? (
				<Button onClick={share} className="h-9 rounded-lg px-3 text-sm">
					<Share2 aria-hidden />
					Compartilhar
				</Button>
			) : null}
		</div>
	);
}
