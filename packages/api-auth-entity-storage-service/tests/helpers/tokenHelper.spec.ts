// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HeaderTypes } from "@twin.org/web";
import { TokenHelper } from "../../src/utils/tokenHelper.js";

describe("TokenHelper", () => {
	it("should extract token from valid Authorization header", () => {
		const headers = { [HeaderTypes.Authorization]: "Bearer mytoken123" };
		const result = TokenHelper.extractTokenFromHeaders(headers);
		expect(result).toEqual({ token: "mytoken123", location: "authorization" });
	});

	it("should return undefined if Authorization header is missing", () => {
		const headers = {};
		const token = TokenHelper.extractTokenFromHeaders(headers);
		expect(token).toBeUndefined();
	});

	it("should return undefined if Authorization header is not Bearer", () => {
		const headers = { [HeaderTypes.Authorization]: "Basic abcdef" };
		const token = TokenHelper.extractTokenFromHeaders(headers);
		expect(token).toBeUndefined();
	});

	it("should return undefined if Authorization header is malformed", () => {
		const headers = { [HeaderTypes.Authorization]: "Bearer" };
		const token = TokenHelper.extractTokenFromHeaders(headers);
		expect(token).toBeUndefined();
	});

	it("should handle lowercase authorization header", () => {
		const headers = { [HeaderTypes.Authorization]: "Bearer tokenXYZ" };
		const result = TokenHelper.extractTokenFromHeaders(headers);
		expect(result).toEqual({ token: "tokenXYZ", location: "authorization" });
	});

	it("should trim token value", () => {
		const headers = { [HeaderTypes.Authorization]: "Bearer   spacedtoken   " };
		const result = TokenHelper.extractTokenFromHeaders(headers);
		expect(result).toEqual({ token: "spacedtoken", location: "authorization" });
	});

	it("should extract token from cookie header", () => {
		const headers = { [HeaderTypes.Cookie]: "token=mycookie123" };
		const result = TokenHelper.extractTokenFromHeaders(headers, "token");
		expect(result).toEqual({ token: "mycookie123", location: "cookie" });
	});

	it("should extract token from cookie header with multiple cookies", () => {
		const headers = { [HeaderTypes.Cookie]: "foo=bar; token=multiToken; session=abc" };
		const result = TokenHelper.extractTokenFromHeaders(headers, "token");
		expect(result).toEqual({ token: "multiToken", location: "cookie" });
	});

	it("should return undefined if cookie header does not contain token", () => {
		const headers = { [HeaderTypes.Cookie]: "foo=bar; session=abc" };
		const result = TokenHelper.extractTokenFromHeaders(headers, "token");
		expect(result).toBeUndefined();
	});

	it("should return undefined if cookie header is empty", () => {
		const headers = { [HeaderTypes.Cookie]: "" };
		const result = TokenHelper.extractTokenFromHeaders(headers, "token");
		expect(result).toBeUndefined();
	});

	it("should extract token with custom cookie name", () => {
		const headers = { [HeaderTypes.Cookie]: "customToken=abc123" };
		const result = TokenHelper.extractTokenFromHeaders(headers, "customToken");
		expect(result).toEqual({ token: "abc123", location: "cookie" });
	});

	it("should trim token value from cookie", () => {
		const headers = { [HeaderTypes.Cookie]: "token=   spacedcookie   " };
		const result = TokenHelper.extractTokenFromHeaders(headers, "token");
		expect(result).toEqual({ token: "spacedcookie", location: "cookie" });
	});
});
