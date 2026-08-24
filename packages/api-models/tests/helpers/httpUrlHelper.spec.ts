// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HttpUrlHelper } from "../../src/helpers/httpUrlHelper.js";

describe("HttpUrlHelper", () => {
	describe("extractOrigin", () => {
		it("should extract protocol and host", () => {
			const result = HttpUrlHelper.extractOrigin("https://example.com/some/path?x=1#frag");
			expect(result).toBe("https://example.com");
		});

		it("should include non-default port exactly once", () => {
			const result = HttpUrlHelper.extractOrigin("https://example.com:8443/some/path");
			expect(result).toBe("https://example.com:8443");
		});

		it("should work with localhost", () => {
			const result = HttpUrlHelper.extractOrigin("http://localhost:3000/api/v1");
			expect(result).toBe("http://localhost:3000");
		});

		it("should not include username or password", () => {
			const result = HttpUrlHelper.extractOrigin("https://user:pass@example.com:8443/a/b");
			expect(result).toBe("https://example.com:8443");
		});
	});

	describe("extractPath", () => {
		it("should extract the pathname", () => {
			const result = HttpUrlHelper.extractPath("https://example.com/some/path?x=1#frag");
			expect(result).toBe("/some/path");
		});

		it("should return slash for root", () => {
			const result = HttpUrlHelper.extractPath("https://example.com");
			expect(result).toBe("/");
		});
	});

	describe("extractSearch", () => {
		it("should extract the query string including leading question mark", () => {
			const result = HttpUrlHelper.extractSearch("https://example.com/a?x=1&y=2#frag");
			expect(result).toBe("?x=1&y=2");
		});

		it("should return empty string when there is no query", () => {
			const result = HttpUrlHelper.extractSearch("https://example.com/a#frag");
			expect(result).toBe("");
		});
	});

	describe("extractPathAndSearch", () => {
		it("should combine pathname and search", () => {
			const result = HttpUrlHelper.extractPathAndSearch("https://example.com/a/b?x=1&y=2#frag");
			expect(result).toBe("/a/b?x=1&y=2");
		});

		it("should return only pathname when there is no search", () => {
			const result = HttpUrlHelper.extractPathAndSearch("https://example.com/a/b#frag");
			expect(result).toBe("/a/b");
		});
	});

	describe("combineOriginPath", () => {
		it("should join origin with path using single slash", () => {
			const result = HttpUrlHelper.combineOriginPath(
				"https://example.com/",
				"/api/v1/resource?x=1"
			);
			expect(result).toBe("https://example.com/api/v1/resource?x=1");
		});

		it("should trim extra slashes from both parts", () => {
			const result = HttpUrlHelper.combineOriginPath("https://example.com///", "///api");
			expect(result).toBe("https://example.com/api");
		});

		it("should return path alone when origin is omitted", () => {
			expect(HttpUrlHelper.combineOriginPath(undefined, "/api/items")).toBe("/api/items");
		});

		it("should return path alone when origin is an empty string", () => {
			expect(HttpUrlHelper.combineOriginPath("", "/api/items")).toBe("/api/items");
		});

		it("should return origin alone when path is omitted", () => {
			expect(HttpUrlHelper.combineOriginPath("https://example.com")).toBe("https://example.com");
		});

		it("should return origin alone when path is an empty string", () => {
			expect(HttpUrlHelper.combineOriginPath("https://example.com", "")).toBe(
				"https://example.com"
			);
		});

		it("should return undefined when both origin and path are absent", () => {
			expect(HttpUrlHelper.combineOriginPath()).toBeUndefined();
			expect(HttpUrlHelper.combineOriginPath(undefined, undefined)).toBeUndefined();
			expect(HttpUrlHelper.combineOriginPath("", "")).toBeUndefined();
		});

		it("should prepend a leading slash to a relative path with no leading slash", () => {
			expect(HttpUrlHelper.combineOriginPath("https://example.com", "api/items")).toBe(
				"https://example.com/api/items"
			);
		});

		it("should prepend a leading slash to a path-only value with no leading slash", () => {
			expect(HttpUrlHelper.combineOriginPath(undefined, "api/items")).toBe("/api/items");
		});
	});

	describe("encodeUriPathSegment", () => {
		it("should not encode colon", () => {
			expect(HttpUrlHelper.encodeUriPathSegment("urn:example:123")).toBe("urn:example:123");
		});

		it("should not encode at-sign", () => {
			expect(HttpUrlHelper.encodeUriPathSegment("user@domain")).toBe("user@domain");
		});

		it("should not encode sub-delimiters", () => {
			expect(HttpUrlHelper.encodeUriPathSegment("a$b&c+d,e;f=g")).toBe("a$b&c+d,e;f=g");
		});

		it("should percent-encode space", () => {
			expect(HttpUrlHelper.encodeUriPathSegment("hello world")).toBe("hello%20world");
		});

		it("should percent-encode question mark", () => {
			expect(HttpUrlHelper.encodeUriPathSegment("foo?bar")).toBe("foo%3Fbar");
		});

		it("should percent-encode hash", () => {
			expect(HttpUrlHelper.encodeUriPathSegment("foo#bar")).toBe("foo%23bar");
		});

		it("should leave unreserved characters unchanged", () => {
			expect(HttpUrlHelper.encodeUriPathSegment("abc-._~123")).toBe("abc-._~123");
		});
	});

	describe("addQueryStringParam", () => {
		it("should add a new parameter to a url with no existing query string", () => {
			const result = HttpUrlHelper.addQueryStringParam("https://example.com/api", "page", "1");
			expect(result).toBe("https://example.com/api?page=1");
		});

		it("should add a new parameter alongside existing parameters", () => {
			const result = HttpUrlHelper.addQueryStringParam("https://example.com/api?x=1", "page", "2");
			expect(result).toBe("https://example.com/api?x=1&page=2");
		});

		// Regression tests for duplicate query params when updating an existing key
		it("should replace the value when the key already exists in the url", () => {
			const result = HttpUrlHelper.addQueryStringParam(
				"https://example.com/api?page=1",
				"page",
				"2"
			);
			expect(result).toBe("https://example.com/api?page=2");
		});

		it("should not produce duplicate entries when the key already exists", () => {
			const result = HttpUrlHelper.addQueryStringParam(
				"https://example.com/api?organization=providerOrg",
				"organization",
				"consumerOrg"
			);
			const params = new URL(result).searchParams.getAll("organization");
			expect(params).toHaveLength(1);
			expect(params[0]).toBe("consumerOrg");
		});

		it("should add or replace a parameter on a relative url", () => {
			const result = HttpUrlHelper.addQueryStringParam("/api/items?cursor=old", "cursor", "new");
			expect(result).toBe("/api/items?cursor=new");
		});

		it("should return the url unchanged when url is empty", () => {
			const result = HttpUrlHelper.addQueryStringParam("", "page", "1");
			expect(result).toBe("");
		});

		it("should return the url unchanged when key is empty", () => {
			const result = HttpUrlHelper.addQueryStringParam("https://example.com/api", "", "1");
			expect(result).toBe("https://example.com/api");
		});

		it("should return the url unchanged when value is empty", () => {
			const result = HttpUrlHelper.addQueryStringParam("https://example.com/api", "page", "");
			expect(result).toBe("https://example.com/api");
		});
	});

	describe("replaceOrigin", () => {
		it("should return the original url when inputs are not valid", () => {
			expect(
				HttpUrlHelper.replaceOrigin(undefined as unknown as string, "https://example.com")
			).toBeUndefined();
			expect(HttpUrlHelper.replaceOrigin("https://old.example.com/a", undefined)).toBe(
				"https://old.example.com/a"
			);
			expect(HttpUrlHelper.replaceOrigin("", "https://example.com")).toBe("");
			expect(HttpUrlHelper.replaceOrigin("https://old.example.com/a", "")).toBe(
				"https://old.example.com/a"
			);
		});

		it("should replace the host and port while keeping the path, query and hash", () => {
			const url = "https://old.example.com:1234/api/v1/resource?x=1&y=2#frag";
			const newHost = "https://new.example.org:9876/somewhere/else";

			const result = HttpUrlHelper.replaceOrigin(url, newHost);

			expect(result).toBe("https://new.example.org:9876/api/v1/resource?x=1&y=2#frag");
		});

		it("should replace the protocol when replacing the host", () => {
			const url = "http://old.example.com:80/api";
			const newHost = "https://new.example.org:8443/";

			const result = HttpUrlHelper.replaceOrigin(url, newHost);

			expect(result).toBe("https://new.example.org:8443/api");
		});

		it("should remove the port when the new host does not specify one", () => {
			const url = "https://old.example.com:1234/api";
			const newHost = "https://new.example.org";

			const result = HttpUrlHelper.replaceOrigin(url, newHost);

			expect(result).toBe("https://new.example.org/api");
		});

		it("should return original url when either url or new host are not http(s)", () => {
			expect(HttpUrlHelper.replaceOrigin("/relative/path", "https://example.com")).toEqual(
				"https://example.com/relative/path"
			);
			expect(HttpUrlHelper.replaceOrigin("https://example.com/a", "example.com")).toEqual(
				"https://example.com/a"
			);
		});
	});
});
