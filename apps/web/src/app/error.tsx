"use client";

import { Button } from "@desconfia/ui/components/button";

export default function ErrorPage({
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	return (
		<div className="mx-auto max-w-xl px-4 py-24 text-center">
			<h1 className="text-2xl font-semibold tracking-tight">Algo deu errado</h1>
			<p className="text-muted-foreground mt-3">
				Não conseguimos carregar esta página. Tente novamente em instantes.
			</p>
			<Button onClick={reset} className="mt-8 h-10 rounded-lg px-4 text-sm">
				Tentar novamente
			</Button>
		</div>
	);
}
