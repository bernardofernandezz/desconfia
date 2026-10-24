import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ENV } from "@/env.server";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: ENV.SITE_URL ? new URL(ENV.SITE_URL) : undefined,
	title: {
		default: "Desconfia — verificação de alegações políticas",
		template: "%s · Desconfia",
	},
	description:
		"Cole uma alegação política ou o link de uma notícia e receba um relatório com evidências, fontes e o nível de confiança da análise.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<a
					href="#conteudo"
					className="bg-foreground text-background sr-only z-50 rounded-md px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
				>
					Pular para o conteúdo
				</a>
				<Providers>
					<div className="flex min-h-svh flex-col">
						<SiteHeader />
						<main id="conteudo" tabIndex={-1} className="flex-1 outline-none">
							{children}
						</main>
						<SiteFooter />
					</div>
				</Providers>
			</body>
		</html>
	);
}
