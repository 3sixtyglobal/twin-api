// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError, Guards, Is, StringHelper } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { HeaderHelper, HeaderTypes, MimeTypes, type IHttpHeaders } from "@twin.org/web";
import { HttpUrlHelper } from "./httpUrlHelper.js";

/**
 * Class to help with handling http headers.
 */
export class HttpHeaderHelper {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<HttpHeaderHelper>();

	/**
	 * Set the Link header with a next cursor relation when a cursor is present.
	 * @param headers The response headers to mutate.
	 * @param url The request URL used as the base for the link.
	 * @param publicOrigin The public origin to substitute into the URL, if any.
	 * @param cursor The cursor value; when undefined or empty the header is not set.
	 */
	public static buildCursor(
		headers: IHttpHeaders,
		url: string,
		publicOrigin: string | undefined,
		cursor: string | undefined
	): asserts headers is IHttpHeaders & { [HeaderTypes.Link]: string | undefined } {
		if (Is.stringValue(cursor)) {
			headers[HeaderTypes.Link] = HeaderHelper.createLinkHeader(
				HttpUrlHelper.replaceOrigin(url, publicOrigin),
				{ cursor },
				"next"
			);
		}
	}

	/**
	 * Set the Location header to the encoded ID, optionally placed within a base URL or template.
	 * When baseUrl contains a colon-prefixed placeholder (e.g. "/path1/:id/path2") the
	 * encoded ID is substituted at that position; otherwise it is appended.
	 * The base URL may be an absolute URL or a relative path. When omitted the bare
	 * encoded ID is used.
	 * @param headers The response headers to mutate.
	 * @param id The resource ID to encode and place.
	 * @param baseUrl The optional base URL, relative path, or URL template.
	 */
	public static buildId(
		headers: IHttpHeaders,
		id: string,
		baseUrl?: string
	): asserts headers is IHttpHeaders & { [HeaderTypes.Location]: string } {
		Guards.stringValue(HttpHeaderHelper.CLASS_NAME, nameof(id), id);
		const encodedId = encodeURIComponent(id);
		if (Is.stringValue(baseUrl)) {
			if (baseUrl.includes("/:")) {
				headers[HeaderTypes.Location] = baseUrl.replace(/\/:[^/?#]+/, `/${encodedId}`);
			} else {
				headers[HeaderTypes.Location] = `${StringHelper.trimTrailingSlashes(baseUrl)}/${encodedId}`;
			}
		} else {
			headers[HeaderTypes.Location] = encodedId;
		}
	}

	/**
	 * Set the Content-Type header to JSON-LD or JSON depending on the request Accept header.
	 * Uses HeaderHelper.extractAccept which parses the Accept header per RFC 7231 and returns
	 * entries ordered by quality descending, preserving original order for equal q-values.
	 * @param headers The response headers to mutate.
	 * @param requestHeaders The request headers to inspect for the Accept value.
	 */
	public static buildJsonContentType(
		headers: IHttpHeaders,
		requestHeaders?: IHttpHeaders
	): asserts headers is IHttpHeaders & {
		[HeaderTypes.ContentType]: typeof MimeTypes.JsonLd | typeof MimeTypes.Json;
	} {
		const accepted = HeaderHelper.extractAccept(requestHeaders);
		let contentType: string = MimeTypes.Json;
		if (Is.arrayValue(accepted)) {
			for (const { mimeType } of accepted) {
				if (mimeType === MimeTypes.JsonLd) {
					contentType = MimeTypes.JsonLd;
					break;
				}
				if (mimeType === MimeTypes.Json || mimeType === "application/*" || mimeType === "*/*") {
					break;
				}
			}
		}
		headers[HeaderTypes.ContentType] = contentType;
	}

	/**
	 * Extract the cursor from the Link header's next relation.
	 * @param headers The response headers to extract the cursor from.
	 * @returns The cursor value or undefined if not present.
	 */
	public static extractCursor(headers?: IHttpHeaders): string | undefined {
		return HeaderHelper.extractLinkHeaderRelation(headers?.[HeaderTypes.Link], "next")
			?.urlQueryParams?.cursor;
	}

	/**
	 * Extract the resource ID from the Location response header.
	 * Handles absolute URLs (http://host/path/:id, http://host/path/:id?foo=bar),
	 * relative paths (/segment/:id, ./segment/:id), and bare ID values.
	 * When a URL template such as "/path1/:id/path2" is supplied the ID is extracted
	 * from the segment position marked by the first colon-prefixed placeholder.
	 * Without a template the last path segment is returned.
	 * @param headers The response headers containing the Location header.
	 * @param template Optional URL template with a colon-prefixed placeholder marking the ID position, e.g. "/path1/:id/path2".
	 * @returns The extracted ID string.
	 * @throws GeneralError If the Location header is missing, the template has no placeholder, or the ID cannot be extracted.
	 */
	public static extractId(headers?: IHttpHeaders, template?: string): string {
		const location = headers?.[HeaderTypes.Location];
		if (!Is.stringValue(location)) {
			throw new GeneralError(HttpHeaderHelper.CLASS_NAME, "locationMissing");
		}

		const withoutQuery = location.split("?")[0];

		if (Is.stringValue(template)) {
			const templateSegments = template.split("/").filter(s => s.length > 0);
			const placeholderIndex = templateSegments.findIndex(s => s.startsWith(":"));
			if (placeholderIndex === -1) {
				throw new GeneralError(HttpHeaderHelper.CLASS_NAME, "templateNoPlaceholder");
			}

			let path = withoutQuery;
			try {
				path = new URL(withoutQuery).pathname;
			} catch {}

			const locationSegments = path.split("/").filter(s => s.length > 0 && s !== ".");
			const id = locationSegments[placeholderIndex];

			if (!Is.stringValue(id)) {
				throw new GeneralError(HttpHeaderHelper.CLASS_NAME, "idNotFound");
			}
			return decodeURIComponent(id);
		}

		const id = withoutQuery.includes("/") ? withoutQuery.split("/").pop() : withoutQuery;

		if (!Is.stringValue(id)) {
			throw new GeneralError(HttpHeaderHelper.CLASS_NAME, "idNotFound");
		}
		return decodeURIComponent(id);
	}
}
