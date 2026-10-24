import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
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
				<Providers>
					<div className="flex min-h-svh flex-col">
						<SiteHeader />
						<main className="flex-1">{children}</main>
						<SiteFooter />
					</div>
				</Providers>
			</body>
		</html>
	);
}
