// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError } from "@twin.org/core";
import { MimeTypes, type IHttpHeaders } from "@twin.org/web";
import { HttpHeaderHelper } from "../../src/helpers/httpHeaderHelper.js";

describe("HttpHeaderHelper", () => {
	describe("extractCursor", () => {
		it("should return the cursor from a next relation link header", () => {
			const headers = { link: '<https://example.com/api?cursor=abc123>; rel="next"' };
			expect(HttpHeaderHelper.extractCursor(headers)).toBe("abc123");
		});

		it("should return undefined when headers is undefined", () => {
			expect(HttpHeaderHelper.extractCursor(undefined)).toBeUndefined();
		});

		it("should return undefined when there is no link header", () => {
			expect(HttpHeaderHelper.extractCursor({})).toBeUndefined();
		});

		it("should return undefined when the link header has no next relation", () => {
			const headers = { link: '<https://example.com/api?cursor=abc123>; rel="prev"' };
			expect(HttpHeaderHelper.extractCursor(headers)).toBeUndefined();
		});

		it("should return undefined when the next relation has no cursor query param", () => {
			const headers = { link: '<https://example.com/api>; rel="next"' };
			expect(HttpHeaderHelper.extractCursor(headers)).toBeUndefined();
		});

		it("should decode a percent-encoded cursor value", () => {
			const headers = { link: '<https://example.com/api?cursor=hello%20world>; rel="next"' };
			expect(HttpHeaderHelper.extractCursor(headers)).toBe("hello world");
		});

		it("should extract cursor from next when multiple relations are present", () => {
			const headers = {
				link: '<https://example.com/api?cursor=prev99>; rel="prev", <https://example.com/api?cursor=next42>; rel="next"'
			};
			expect(HttpHeaderHelper.extractCursor(headers)).toBe("next42");
		});
	});

	describe("extractId", () => {
		it("should extract the ID from a full URL", () => {
			const headers = { location: "http://host.local/path/my-id" };
			expect(HttpHeaderHelper.extractId(headers)).toBe("my-id");
		});

		it("should extract the ID from a full URL with a query string", () => {
			const headers = { location: "http://host.local/path/my-id?foo=blah" };
			expect(HttpHeaderHelper.extractId(headers)).toBe("my-id");
		});

		it("should extract the ID from a relative path", () => {
			const headers = { location: "/segment/my-id" };
			expect(HttpHeaderHelper.extractId(headers)).toBe("my-id");
		});

		it("should extract the ID from a relative path with a query string", () => {
			const headers = { location: "/segment/my-id?foo=blah" };
			expect(HttpHeaderHelper.extractId(headers)).toBe("my-id");
		});

		it("should extract the ID from a dot-relative path", () => {
			const headers = { location: "./segment/my-id" };
			expect(HttpHeaderHelper.extractId(headers)).toBe("my-id");
		});

		it("should extract the ID from a dot-relative path with a query string", () => {
			const headers = { location: "./segment/my-id?foo=blah" };
			expect(HttpHeaderHelper.extractId(headers)).toBe("my-id");
		});

		it("should return a bare ID value as-is", () => {
			const headers = { location: "my-id" };
			expect(HttpHeaderHelper.extractId(headers)).toBe("my-id");
		});

		it("should decode a percent-encoded ID in a full URL", () => {
			const headers = { location: "http://host.local/path/hello%20world" };
			expect(HttpHeaderHelper.extractId(headers)).toBe("hello world");
		});

		it("should decode a percent-encoded ID in a relative path", () => {
			const headers = { location: "/segment/hello%20world" };
			expect(HttpHeaderHelper.extractId(headers)).toBe("hello world");
		});

		it("should decode a percent-encoded bare ID", () => {
			const headers = { location: "hello%20world" };
			expect(HttpHeaderHelper.extractId(headers)).toBe("hello world");
		});

		it("should extract the ID from the middle of a full URL using a template", () => {
			const headers = { location: "http://host.local/path1/path2/my-id/path3" };
			expect(HttpHeaderHelper.extractId(headers, "/path1/path2/:id/path3")).toBe("my-id");
		});

		it("should extract the ID from a full URL with query string using a template", () => {
			const headers = { location: "http://host.local/path1/my-id/path2?foo=bar" };
			expect(HttpHeaderHelper.extractId(headers, "/path1/:id/path2")).toBe("my-id");
		});

		it("should extract the ID from a relative path using a template", () => {
			const headers = { location: "/path1/path2/my-id/path3" };
			expect(HttpHeaderHelper.extractId(headers, "/path1/path2/:id/path3")).toBe("my-id");
		});

		it("should extract the ID from a dot-relative path using a template", () => {
			const headers = { location: "./path1/path2/my-id/path3" };
			expect(HttpHeaderHelper.extractId(headers, "/path1/path2/:id/path3")).toBe("my-id");
		});

		it("should decode a percent-encoded ID when using a template", () => {
			const headers = { location: "/path1/hello%20world/path2" };
			expect(HttpHeaderHelper.extractId(headers, "/path1/:id/path2")).toBe("hello world");
		});

		it("should throw when the template has no colon-prefixed placeholder", () => {
			const headers = { location: "/path1/my-id/path2" };
			expect(() => HttpHeaderHelper.extractId(headers, "/path1/id/path2")).toThrow(GeneralError);
		});

		it("should throw when the location has no segment at the placeholder position", () => {
			const headers = { location: "/path1" };
			expect(() => HttpHeaderHelper.extractId(headers, "/path1/:id/path2")).toThrow(GeneralError);
		});

		it("should roundtrip with buildId", () => {
			const original = "hello world";
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildId(headers, original, "/path");
			expect(HttpHeaderHelper.extractId(headers)).toBe(original);
		});

		it("should throw when headers is undefined", () => {
			expect(() => HttpHeaderHelper.extractId(undefined)).toThrow(GeneralError);
		});

		it("should throw when the location header is missing", () => {
			expect(() => HttpHeaderHelper.extractId({})).toThrow(GeneralError);
		});

		it("should throw when the location header is an empty string", () => {
			expect(() => HttpHeaderHelper.extractId({ location: "" })).toThrow(GeneralError);
		});
	});

	describe("buildId", () => {
		it("should throw when id is an empty string", () => {
			expect(() => HttpHeaderHelper.buildId({}, "")).toThrow();
		});

		it("should set the Location header to the bare encoded ID when no baseUrl is provided", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildId(headers, "my-id");
			expect(headers.location).toBe("my-id");
		});

		it("should append the ID to an absolute baseUrl", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildId(headers, "my-id", "https://example.com/path");
			expect(headers.location).toBe("https://example.com/path/my-id");
		});

		it("should append the ID to a relative baseUrl", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildId(headers, "my-id", "/segment");
			expect(headers.location).toBe("/segment/my-id");
		});

		it("should trim a trailing slash from baseUrl before appending", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildId(headers, "my-id", "https://example.com/path/");
			expect(headers.location).toBe("https://example.com/path/my-id");
		});

		it("should set the bare ID when baseUrl is an empty string", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildId(headers, "my-id", "");
			expect(headers.location).toBe("my-id");
		});

		it("should percent-encode a bare ID with special characters", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildId(headers, "hello world");
			expect(headers.location).toBe("hello%20world");
		});

		it("should percent-encode the ID when appended to a baseUrl", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildId(headers, "hello world", "/path");
			expect(headers.location).toBe("/path/hello%20world");
		});

		it("should substitute the ID at the placeholder position in a template", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildId(headers, "my-id", "/path1/:id/path2");
			expect(headers.location).toBe("/path1/my-id/path2");
		});

		it("should substitute the ID when the placeholder is any colon-prefixed name", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildId(headers, "my-id", "/path1/:resourceId/path2");
			expect(headers.location).toBe("/path1/my-id/path2");
		});

		it("should substitute the ID in an absolute URL template", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildId(headers, "my-id", "https://example.com/path1/:id/path2");
			expect(headers.location).toBe("https://example.com/path1/my-id/path2");
		});

		it("should percent-encode the ID when substituting into a template", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildId(headers, "hello world", "/path1/:id/path2");
			expect(headers.location).toBe("/path1/hello%20world/path2");
		});

		it("should only replace the first placeholder in a template", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildId(headers, "my-id", "/path/:a/:b");
			expect(headers.location).toBe("/path/my-id/:b");
		});
	});

	describe("buildCursor", () => {
		it("should set the Link header when cursor is a non-empty string", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildCursor(headers, "https://example.com/api", undefined, "abc123");
			expect(headers.link).toContain("cursor=abc123");
			expect(headers.link).toContain('rel="next"');
		});

		it("should replace the origin in the URL when publicOrigin is provided", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildCursor(
				headers,
				"https://internal.host/api/items",
				"https://public.host",
				"tok1"
			);
			expect(headers.link).toContain("https://public.host");
			expect(headers.link).not.toContain("internal.host");
		});

		it("should not modify headers when cursor is undefined", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildCursor(headers, "https://example.com/api", undefined, undefined);
			expect(headers.link).toBeUndefined();
		});

		it("should not modify headers when cursor is an empty string", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildCursor(headers, "https://example.com/api", undefined, "");
			expect(headers.link).toBeUndefined();
		});

		it("should not overwrite an existing header when cursor is absent", () => {
			const headers: IHttpHeaders = {
				link: '<https://example.com/api?cursor=old>; rel="prev"'
			};
			HttpHeaderHelper.buildCursor(headers, "https://example.com/api", undefined, undefined);
			expect(headers.link).toContain("old");
		});
	});

	describe("buildJsonContentType", () => {
		it("should set content-type to JSON-LD when Accept is JSON-LD", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildJsonContentType(headers, { accept: MimeTypes.JsonLd });
			expect(headers["content-type"]).toBe(MimeTypes.JsonLd);
		});

		it("should set content-type to JSON when Accept is JSON", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildJsonContentType(headers, { accept: MimeTypes.Json });
			expect(headers["content-type"]).toBe(MimeTypes.Json);
		});

		it("should set content-type to JSON when Accept is some other value", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildJsonContentType(headers, { accept: "text/html" });
			expect(headers["content-type"]).toBe(MimeTypes.Json);
		});

		it("should set content-type to JSON when requestHeaders is undefined", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildJsonContentType(headers, undefined);
			expect(headers["content-type"]).toBe(MimeTypes.Json);
		});

		it("should set content-type to JSON when requestHeaders has no Accept header", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildJsonContentType(headers, {});
			expect(headers["content-type"]).toBe(MimeTypes.Json);
		});

		it("should set content-type to JSON-LD when JSON-LD appears first with equal q-values", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildJsonContentType(headers, {
				accept: `${MimeTypes.JsonLd}, ${MimeTypes.Json}`
			});
			expect(headers["content-type"]).toBe(MimeTypes.JsonLd);
		});

		it("should set content-type to JSON when JSON appears first with equal q-values", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildJsonContentType(headers, {
				accept: `${MimeTypes.Json}, ${MimeTypes.JsonLd}`
			});
			expect(headers["content-type"]).toBe(MimeTypes.Json);
		});

		it("should prefer JSON-LD when it has a higher q-value than JSON", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildJsonContentType(headers, {
				accept: `${MimeTypes.Json};q=0.9, ${MimeTypes.JsonLd}`
			});
			expect(headers["content-type"]).toBe(MimeTypes.JsonLd);
		});

		it("should prefer JSON when it has a higher q-value than JSON-LD", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildJsonContentType(headers, {
				accept: `${MimeTypes.JsonLd};q=0.9, ${MimeTypes.Json}`
			});
			expect(headers["content-type"]).toBe(MimeTypes.Json);
		});

		it("should set content-type to JSON when Accept is a wildcard", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildJsonContentType(headers, { accept: "*/*" });
			expect(headers["content-type"]).toBe(MimeTypes.Json);
		});

		it("should set content-type to JSON when Accept is application wildcard", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildJsonContentType(headers, { accept: "application/*" });
			expect(headers["content-type"]).toBe(MimeTypes.Json);
		});

		it("should prefer JSON-LD over a wildcard when JSON-LD appears first", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildJsonContentType(headers, {
				accept: `${MimeTypes.JsonLd}, */*`
			});
			expect(headers["content-type"]).toBe(MimeTypes.JsonLd);
		});

		it("should handle Accept as a string array", () => {
			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildJsonContentType(headers, {
				accept: [MimeTypes.JsonLd, MimeTypes.Json]
			});
			expect(headers["content-type"]).toBe(MimeTypes.JsonLd);
		});
	});
});
