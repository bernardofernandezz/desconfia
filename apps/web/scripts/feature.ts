import "varlock/auto-load";
import { setFeatured } from "@/lib/reports";

// Editorial picks for /destaques. Never automatic: someone reviews the report first.
const [id, flag] = process.argv.slice(2);

if (!id || (flag && flag !== "--remove")) {
	console.error("Uso: bun run feature <id-do-relatorio> [--remove]");
	process.exit(1);
}

const featured = flag !== "--remove";
if (!(await setFeatured(id, featured))) {
	console.error(`Relatório ${id} não encontrado.`);
	process.exit(1);
}
console.log(
	featured
		? `Relatório ${id} em destaque.`
		: `Relatório ${id} removido dos destaques.`,
);
