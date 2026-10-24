import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
	return (
		<footer className="border-t print:hidden">
			<div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
					<Logo />
					<p>Informação verificável para uma democracia mais forte.</p>
				</div>
				<nav aria-label="Rodapé" className="flex gap-6">
					<Link href="/sobre" className="hover:text-foreground">
						Sobre e metodologia
					</Link>
					<Link href="/#exemplos" className="hover:text-foreground">
						Exemplos
					</Link>
					<Link href="/destaques" className="hover:text-foreground">
						Destaques
					</Link>
				</nav>
			</div>
		</footer>
	);
}
