"use client";

import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@desconfia/ui/components/alert";
import { Button } from "@desconfia/ui/components/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useFocusOnMount } from "@/hooks/use-focus-on-mount";
import type { Failure } from "@/hooks/use-verification";

export function VerificationFailure({
	failure,
	onRetry,
}: {
	failure: Failure;
	onRetry: () => void;
}) {
	const ref = useFocusOnMount<HTMLDivElement>();

	if (failure.code === "demo_mode") {
		return (
			<Alert ref={ref} tabIndex={-1} className="p-4 text-sm outline-none">
				<AlertCircle aria-hidden />
				<AlertTitle>Modo demonstração</AlertTitle>
				<AlertDescription className="text-sm">
					A pesquisa ao vivo não está configurada neste ambiente, então nenhuma
					verificação real foi feita. Veja os{" "}
					<Link href="/#exemplos">relatórios de exemplo</Link> para conhecer o
					formato.
				</AlertDescription>
			</Alert>
		);
	}

	const canRetry =
		failure.code !== "invalid_input" && failure.code !== "not_found";
	return (
		<Alert
			ref={ref}
			tabIndex={-1}
			variant="destructive"
			className="p-4 text-sm outline-none"
		>
			<AlertCircle aria-hidden />
			<AlertTitle>Não foi possível concluir a verificação</AlertTitle>
			<AlertDescription className="space-y-3 text-sm">
				<p>{failure.message}</p>
				{canRetry ? (
					<Button variant="outline" size="sm" onClick={onRetry}>
						Tentar novamente
					</Button>
				) : null}
			</AlertDescription>
		</Alert>
	);
}
