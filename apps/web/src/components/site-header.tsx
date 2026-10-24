import Link from "next/link";
import { navLinks } from "@/lib/nav";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { ModeToggle } from "./mode-toggle";

export function SiteHeader() {
	return (
		<header className="bg-background/80 border-b backdrop-blur print:hidden">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
				<Logo />
				<nav
					aria-label="Principal"
					className="text-muted-foreground hidden items-center gap-8 text-sm md:flex"
				>
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="hover:text-foreground rounded-sm"
						>
							{link.label}
						</Link>
					))}
				</nav>
				<div className="flex items-center gap-1">
					<ModeToggle />
					<MobileNav />
				</div>
			</div>
		</header>
	);
}
