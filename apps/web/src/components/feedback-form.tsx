"use client";

import { Button } from "@desconfia/ui/components/button";
import { useState } from "react";
import { toast } from "sonner";

const feedbackOptions = [
	{ value: "wrong_verdict", label: "A avaliação parece errada" },
	{ value: "bad_source", label: "Uma fonte não diz o que o relatório afirma" },
	{ value: "other", label: "Outro problema" },
] as const;

type FeedbackKind = (typeof feedbackOptions)[number]["value"];

export function FeedbackForm({ reportId }: { reportId: string }) {
	const [kind, setKind] = useState<FeedbackKind>("wrong_verdict");
	const [comment, setComment] = useState("");
	const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		setStatus("sending");
		const response = await fetch(`/api/reports/${reportId}/feedback`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ kind, comment }),
		}).catch(() => null);

		if (response?.ok) return setStatus("sent");
		setStatus("idle");
		const body = await response?.json().catch(() => null);
		toast.error(body?.message ?? "Não foi possível enviar. Tente novamente.");
	}

	if (status === "sent") {
		return (
			<p role="status" className="text-muted-foreground text-sm print:hidden">
				Obrigado! Sua mensagem ajuda a melhorar as verificações.
			</p>
		);
	}

	return (
		<details className="rounded-xl border p-4 text-sm print:hidden">
			<summary className="cursor-pointer font-medium">
				Encontrou um erro neste relatório?
			</summary>
			<form onSubmit={submit} className="mt-4 space-y-4">
				<fieldset className="space-y-2">
					<legend className="sr-only">Tipo de problema</legend>
					{feedbackOptions.map((option) => (
						<label key={option.value} className="flex items-center gap-2">
							<input
								type="radio"
								name="kind"
								value={option.value}
								checked={kind === option.value}
								onChange={() => setKind(option.value)}
								className="accent-foreground size-4"
							/>
							{option.label}
						</label>
					))}
				</fieldset>
				<label className="block space-y-1.5">
					<span className="text-muted-foreground">
						O que está errado? (opcional)
					</span>
					<textarea
						value={comment}
						onChange={(event) => setComment(event.target.value)}
						maxLength={1000}
						rows={3}
						className="bg-background focus-visible:border-ring focus-visible:ring-ring/30 w-full rounded-lg border p-2 outline-none focus-visible:ring-2"
					/>
				</label>
				<Button
					type="submit"
					disabled={status === "sending"}
					className="h-9 rounded-lg px-3 text-sm"
				>
					Enviar
				</Button>
			</form>
		</details>
	);
}
