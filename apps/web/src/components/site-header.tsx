import Link from "next/link";
import { Logo } from "./logo";
import { ModeToggle } from "./mode-toggle";

const links = [
	{ href: "/#como-funciona", label: "Como funciona" },
	{ href: "/#exemplos", label: "Exemplos" },
	{ href: "/sobre", label: "Sobre" },
] as const;

export function SiteHeader() {
	return (
		<header className="bg-background/80 border-b backdrop-blur">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
				<Logo />
				<nav
					aria-label="Principal"
					className="text-muted-foreground hidden items-center gap-8 text-sm md:flex"
				>
					{links.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="hover:text-foreground rounded-sm"
						>
							{link.label}
						</Link>
					))}
				</nav>
				<ModeToggle />
			</div>
		</header>
	);
}
