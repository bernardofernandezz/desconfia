"use client";

import { Button } from "@desconfia/ui/components/button";
import { ArrowRight, ImagePlus, Link2, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import {
	useVerification,
	type VerificationPayload,
} from "@/hooks/use-verification";
import {
	acceptedImageTypes,
	MAX_IMAGE_BYTES,
	parseInput,
} from "@/lib/research/input";
import { ResearchProgress } from "./research-progress";
import { VerificationFailure } from "./verification-failure";

const exampleClaims = [
	"O governo criou um imposto sobre o PIX",
	"O Bolsa Família paga R$ 600 para qualquer pessoa",
	"O presidente pode se reeleger quantas vezes quiser",
];

function validateImage(file: File) {
	if (!(acceptedImageTypes as string[]).includes(file.type))
		return "Envie uma imagem PNG, JPEG ou WebP.";
	if (file.size > MAX_IMAGE_BYTES) return "A imagem pode ter no máximo 5 MB.";
	return null;
}

export function ClaimForm() {
	const verification = useVerification();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [query, setQuery] = useState("");
	const [image, setImage] = useState<File | null>(null);
	const [fieldError, setFieldError] = useState<string | null>(null);
	const [lastPayload, setLastPayload] = useState<VerificationPayload | null>(
		null,
	);

	const { events, failure, isRunning } = verification;

	function attachImage(file: File) {
		const error = validateImage(file);
		setFieldError(error);
		setImage(error ? null : file);
	}

	function removeImage() {
		setImage(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	}

	function submit() {
		if (isRunning) return;

		let payload: VerificationPayload;
		if (image) {
			payload = { image };
		} else {
			const parsed = parseInput(query);
			if (!parsed.ok) return setFieldError(parsed.error);
			payload = { query };
		}

		setFieldError(null);
		setLastPayload(payload);
		verification.start(payload);
	}

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		submit();
	}

	function handlePaste(event: React.ClipboardEvent) {
		const file = event.clipboardData.files[0];
		if (!file?.type.startsWith("image/")) return;
		event.preventDefault();
		attachImage(file);
	}

	return (
		<div className="space-y-4">
			<form onSubmit={handleSubmit} noValidate>
				<label htmlFor="claim" className="sr-only">
					Alegação ou link da notícia
				</label>
				<div className="bg-card focus-within:border-ring focus-within:ring-ring/30 has-aria-invalid:border-destructive flex flex-col gap-2 rounded-xl border p-2 shadow-sm transition-shadow focus-within:ring-2 sm:flex-row sm:items-start">
					<div className="flex flex-1 items-start gap-3 px-2 pt-2.5">
						<Link2
							className="text-muted-foreground mt-0.5 size-4 shrink-0"
							aria-hidden
						/>
						{image ? (
							<div className="bg-muted flex min-w-0 items-center gap-2 rounded-md py-0.5 pr-1 pl-2 text-sm">
								<span className="truncate">{image.name}</span>
								<button
									type="button"
									onClick={removeImage}
									disabled={isRunning}
									className="hover:bg-background focus-visible:outline-ring rounded-sm p-0.5 focus-visible:outline-2"
								>
									<X className="size-3.5" aria-hidden />
									<span className="sr-only">Remover imagem</span>
								</button>
							</div>
						) : (
							<textarea
								id="claim"
								name="claim"
								rows={1}
								value={query}
								disabled={isRunning}
								maxLength={1000}
								onChange={(event) => setQuery(event.target.value)}
								onPaste={handlePaste}
								onKeyDown={(event) => {
									if (event.key === "Enter" && !event.shiftKey)
										handleSubmit(event);
								}}
								placeholder="Cole o link, o texto ou o print da mensagem…"
								aria-invalid={fieldError ? true : undefined}
								aria-describedby={fieldError ? "claim-error" : undefined}
								className="placeholder:text-muted-foreground field-sizing-content max-h-48 min-h-6 w-full resize-none bg-transparent text-base outline-none disabled:opacity-60"
							/>
						)}
					</div>
					<div className="flex gap-2">
						<input
							ref={fileInputRef}
							type="file"
							accept={acceptedImageTypes.join(",")}
							className="sr-only"
							tabIndex={-1}
							aria-hidden
							onChange={(event) => {
								const file = event.target.files?.[0];
								if (file) attachImage(file);
							}}
						/>
						<Button
							type="button"
							variant="outline"
							size="icon"
							disabled={isRunning}
							onClick={() => fileInputRef.current?.click()}
							className="size-11 rounded-lg"
						>
							<ImagePlus className="size-4" aria-hidden />
							<span className="sr-only">Enviar print ou imagem</span>
						</Button>
						<Button
							type="submit"
							size="lg"
							disabled={isRunning}
							className="h-11 flex-1 rounded-lg px-5 text-sm sm:flex-none"
						>
							{isRunning ? (
								<Loader2 className="animate-spin" aria-hidden />
							) : null}
							{isRunning ? "Verificando" : "Verificar"}
							{isRunning ? null : <ArrowRight aria-hidden />}
						</Button>
					</div>
				</div>
				{fieldError ? (
					<p id="claim-error" className="text-destructive mt-2 text-sm">
						{fieldError}
					</p>
				) : null}
			</form>

			{!events ? (
				<div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
					<span>Exemplos:</span>
					{exampleClaims.map((claim) => (
						<button
							key={claim}
							type="button"
							onClick={() => {
								removeImage();
								setQuery(claim);
							}}
							className="bg-card hover:border-foreground/30 hover:text-foreground focus-visible:outline-ring rounded-full border px-3 py-1 focus-visible:outline-2"
						>
							“{claim}”
						</button>
					))}
				</div>
			) : null}

			{isRunning && events ? (
				<ResearchProgress events={events} onCancel={verification.cancel} />
			) : null}

			{failure && lastPayload ? (
				<VerificationFailure
					failure={failure}
					onRetry={() => verification.start(lastPayload)}
				/>
			) : null}
		</div>
	);
}
