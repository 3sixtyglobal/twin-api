// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ScopeHelper } from "../../src/helpers/scopeHelper.js";

describe("ScopeHelper", () => {
	describe("toArray from string", () => {
		it("should return an empty array for undefined", () => {
			expect(ScopeHelper.toArray(undefined)).toEqual([]);
		});

		it("should return an empty array for an empty string", () => {
			expect(ScopeHelper.toArray("")).toEqual([]);
		});

		it("should split a comma-separated string into a normalised array", () => {
			expect(ScopeHelper.toArray("read,write")).toEqual(["read", "write"]);
		});

		it("should trim whitespace and lowercase each entry", () => {
			expect(ScopeHelper.toArray(" Read , WRITE ")).toEqual(["read", "write"]);
		});

		it("should filter out empty entries produced by consecutive commas", () => {
			expect(ScopeHelper.toArray("read,,write")).toEqual(["read", "write"]);
		});

		it("should return a single-element array for a string with no commas", () => {
			expect(ScopeHelper.toArray("user-admin")).toEqual(["user-admin"]);
		});
	});

	describe("toArray from array", () => {
		it("should return an empty array for an empty array", () => {
			expect(ScopeHelper.toArray([])).toEqual([]);
		});

		it("should trim whitespace and lowercase each entry", () => {
			expect(ScopeHelper.toArray([" Read ", "WRITE"])).toEqual(["read", "write"]);
		});

		it("should filter out entries that are blank after trimming", () => {
			expect(ScopeHelper.toArray(["read", "  ", "write"])).toEqual(["read", "write"]);
		});
	});

	describe("toString", () => {
		it("should join an array into a comma-separated string", () => {
			expect(ScopeHelper.toString(["read", "write"])).toBe("read,write");
		});

		it("should normalise each entry before joining", () => {
			expect(ScopeHelper.toString([" Read ", "WRITE"])).toBe("read,write");
		});

		it("should return an empty string for an empty array", () => {
			expect(ScopeHelper.toString([])).toBe("");
		});
	});

	describe("includes", () => {
		it("should return true when the value is present in a comma-separated string", () => {
			expect(ScopeHelper.includes("user-admin,global-admin", "global-admin")).toBe(true);
		});

		it("should return false when the value is absent from the string", () => {
			expect(ScopeHelper.includes("user-admin", "global-admin")).toBe(false);
		});

		it("should return false for undefined scope", () => {
			expect(ScopeHelper.includes(undefined, "global-admin")).toBe(false);
		});

		it("should match after normalising a mixed-case string", () => {
			expect(ScopeHelper.includes("User-Admin,Global-Admin", "global-admin")).toBe(true);
		});

		it("should return true when the value is present in an array", () => {
			expect(ScopeHelper.includes(["user-admin", "global-admin"], "global-admin")).toBe(true);
		});

		it("should return false when the value is absent from an array", () => {
			expect(ScopeHelper.includes(["user-admin"], "global-admin")).toBe(false);
		});
	});
});
