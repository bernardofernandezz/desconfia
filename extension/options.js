import { DEFAULT_SITE_URL, isSiteUrl } from "./verify-url.js";

const form = document.getElementById("options");
const input = document.getElementById("site-url");
const status = document.getElementById("status");

const { siteUrl = DEFAULT_SITE_URL } = await chrome.storage.sync.get("siteUrl");
input.value = siteUrl;

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	if (!isSiteUrl(input.value)) {
		status.textContent = "Use um endereço começando com https:// ou http://.";
		return;
	}
	await chrome.storage.sync.set({ siteUrl: input.value });
	status.textContent = "Salvo.";
});
