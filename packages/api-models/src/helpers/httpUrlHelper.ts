// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Is, StringHelper } from "@twin.org/core";

/**
 * Class to help with handling http URLs.
 */
export class HttpUrlHelper {
	/**
	 * Extract the origin from the url which includes protocol,host,port.
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/origin
	 * @param url The url to extract the origin from.
	 * @returns The extracted origin.
	 */
	public static extractOrigin(url: string): string | undefined {
		try {
			const convertedUrl = new URL(url);
			return convertedUrl.origin;
		} catch {}
	}

	/**
	 * Extract the path from the url.
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/pathname
	 * @param url The url to extract the path from.
	 * @returns The extracted path.
	 */
	public static extractPath(url: string): string | undefined {
		try {
			const convertedUrl = new URL(url);
			return convertedUrl.pathname;
		} catch {}
	}

	/**
	 * Extract the search from the url.
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/search
	 * @param url The url to extract the search from.
	 * @returns The extracted search.
	 */
	public static extractSearch(url: string): string | undefined {
		try {
			const convertedUrl = new URL(url);
			return convertedUrl.search;
		} catch {}
	}

	/**
	 * Extract the path and search from the url.
	 * @param url The url to extract the path and search from.
	 * @returns The extracted path and search.
	 */
	public static extractPathAndSearch(url: string): string | undefined {
		try {
			const convertedUrl = new URL(url);
			return `${convertedUrl.pathname}${convertedUrl.search}`;
		} catch {}
	}

	/**
	 * Combine the urls parts.
	 * @param origin The origin to combine.
	 * @param pathAndSearch The path and search to combine.
	 * @returns The combined parts.
	 */
	public static combineParts(origin: string, pathAndSearch: string): string | undefined {
		if (Is.string(origin) && Is.string(pathAndSearch)) {
			return `${StringHelper.trimTrailingSlashes(origin)}/${StringHelper.trimLeadingSlashes(pathAndSearch)}`;
		}
	}

	/**
	 * Replace the origin in the url.
	 * @param url The url to replace the origin in.
	 * @param newOrigin The new origin to use.
	 * @returns The url with the replaced origin.
	 */
	public static replaceOrigin(url: string, newOrigin?: string): string {
		if (!Is.stringValue(url) || !Is.stringValue(newOrigin) || !newOrigin.startsWith("http")) {
			return url;
		}

		try {
			const parsedUrl = new URL(url.startsWith("/") ? `http://placeholder${url}` : url);
			const newParsedUrl = new URL(newOrigin);
			parsedUrl.protocol = newParsedUrl.protocol;
			parsedUrl.host = newParsedUrl.host;
			parsedUrl.port = newParsedUrl.port;
			return parsedUrl.toString();
		} catch {}

		return url;
	}
}
