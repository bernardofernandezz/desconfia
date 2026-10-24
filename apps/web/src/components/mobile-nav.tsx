"use client";

import { Button } from "@desconfia/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@desconfia/ui/components/dropdown-menu";
import { Menu } from "lucide-react";
import Link from "next/link";
import { navLinks } from "@/lib/nav";

export function MobileNav() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button variant="ghost" size="icon" className="md:hidden" />}
			>
				<Menu className="size-5" aria-hidden />
				<span className="sr-only">Abrir menu</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-48">
				{navLinks.map((link) => (
					<DropdownMenuItem
						key={link.href}
						render={<Link href={link.href} />}
						className="py-2 text-sm"
					>
						{link.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
