import { Button } from "@desconfia/ui/components/button";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="mx-auto max-w-xl px-4 py-24 text-center">
			<h1 className="text-2xl font-semibold tracking-tight">
				Página não encontrada
			</h1>
			<p className="text-muted-foreground mt-3">
				O relatório pode ter sido removido ou o link está incompleto. Confira o
				endereço recebido.
			</p>
			<Button
				nativeButton={false}
				render={<Link href="/" />}
				className="mt-8 h-10 rounded-lg px-4 text-sm"
			>
				Fazer uma nova verificação
			</Button>
		</div>
	);
}
