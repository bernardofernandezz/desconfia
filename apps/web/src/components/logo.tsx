import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export function Logo() {
	return (
		<Link
			href="/"
			className="flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight"
		>
			<span className="bg-foreground text-background grid size-7 place-items-center rounded-md">
				<ShieldCheck className="size-4" aria-hidden />
			</span>
			Desconfia
		</Link>
	);
}
