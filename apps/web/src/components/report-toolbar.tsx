"use client";

import { Button } from "@desconfia/ui/components/button";
import { RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useVerification } from "@/hooks/use-verification";
import {
	forgetReport,
	getDeleteToken,
	type RecentReport,
	rememberReport,
} from "@/lib/local-reports";
import { ResearchProgress } from "./research-progress";
import { VerificationFailure } from "./verification-failure";

export function ReportToolbar({ entry }: { entry: RecentReport }) {
	const router = useRouter();
	const verification = useVerification();
	const [deleteToken, setDeleteToken] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		rememberReport(entry);
		setDeleteToken(getDeleteToken(entry.id));
	}, [entry]);

	const refresh = () => verification.start({ refreshOf: entry.id });

	async function deleteReport() {
		if (!deleteToken) return;
		const confirmed = window.confirm(
			"Apagar este relatório? O link deixará de funcionar para todo mundo.",
		);
		if (!confirmed) return;

		setIsDeleting(true);
		const response = await fetch(`/api/reports/${entry.id}`, {
			method: "DELETE",
			headers: { "x-delete-token": deleteToken },
		}).catch(() => null);
		setIsDeleting(false);

		if (!response?.ok) {
			toast.error("Não foi possível apagar o relatório.");
			return;
		}
		forgetReport(entry.id);
		toast.success("Relatório apagado");
		router.push("/");
	}

	return (
		<section className="space-y-4 border-t pt-6 print:hidden">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<p className="text-muted-foreground max-w-md text-sm">
					Os fatos mudam: projetos são aprovados e decisões são publicadas.
					Pesquise de novo para ver se algo mudou.
				</p>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						onClick={refresh}
						disabled={verification.isRunning}
						className="h-9 rounded-lg px-3 text-sm"
					>
						<RefreshCw aria-hidden />
						Pesquisar novamente
					</Button>
					{deleteToken ? (
						<Button
							variant="destructive"
							onClick={deleteReport}
							disabled={isDeleting}
							className="h-9 rounded-lg px-3 text-sm"
						>
							<Trash2 aria-hidden />
							Apagar relatório
						</Button>
					) : null}
				</div>
			</div>
			{verification.isRunning && verification.events ? (
				<ResearchProgress
					events={verification.events}
					onCancel={verification.cancel}
				/>
			) : null}
			{verification.failure ? (
				<VerificationFailure failure={verification.failure} onRetry={refresh} />
			) : null}
		</section>
	);
}
