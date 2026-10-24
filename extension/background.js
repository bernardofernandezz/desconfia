import { buildVerifyUrl, DEFAULT_SITE_URL } from "./verify-url.js";

const MENU_ID = "desconfia-verify";

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: MENU_ID,
		title: "Verificar no Desconfia",
		contexts: ["selection"],
	});
});

chrome.contextMenus.onClicked.addListener(async (info) => {
	if (info.menuItemId !== MENU_ID || !info.selectionText) return;
	const { siteUrl = DEFAULT_SITE_URL } =
		await chrome.storage.sync.get("siteUrl");
	chrome.tabs.create({ url: buildVerifyUrl(siteUrl, info.selectionText) });
});
