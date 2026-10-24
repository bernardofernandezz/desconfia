import { Badge } from "@desconfia/ui/components/badge";
import { cn } from "@desconfia/ui/lib/utils";
import { type Verdict, verdictLabels } from "@/lib/report";

const verdictStyles: Record<Verdict, string> = {
	supported: "bg-verdict-supported/12 text-verdict-supported",
	contradicted: "bg-verdict-contradicted/12 text-verdict-contradicted",
	misleading: "bg-verdict-misleading/15 text-verdict-misleading",
	inconclusive: "bg-verdict-inconclusive/12 text-verdict-inconclusive",
};

export function VerdictBadge({
	verdict,
	className,
}: {
	verdict: Verdict;
	className?: string;
}) {
	return (
		<Badge className={cn(verdictStyles[verdict], className)}>
			{verdictLabels[verdict]}
		</Badge>
	);
}
