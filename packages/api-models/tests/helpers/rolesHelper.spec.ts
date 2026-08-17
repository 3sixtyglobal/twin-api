// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { RolesHelper } from "../../src/helpers/rolesHelper.js";

describe("RolesHelper", () => {
	describe("toArray from string", () => {
		it("should return an empty array for undefined", () => {
			expect(RolesHelper.toArray(undefined)).toEqual([]);
		});

		it("should return an empty array for an empty string", () => {
			expect(RolesHelper.toArray("")).toEqual([]);
		});

		it("should split a comma-separated string into a normalised array", () => {
			expect(RolesHelper.toArray("read,write")).toEqual(["read", "write"]);
		});

		it("should trim whitespace and lowercase each entry", () => {
			expect(RolesHelper.toArray(" Read , WRITE ")).toEqual(["read", "write"]);
		});

		it("should filter out empty entries produced by consecutive commas", () => {
			expect(RolesHelper.toArray("read,,write")).toEqual(["read", "write"]);
		});

		it("should return a single-element array for a string with no commas", () => {
			expect(RolesHelper.toArray("user-admin")).toEqual(["user-admin"]);
		});
	});

	describe("toArray from array", () => {
		it("should return an empty array for an empty array", () => {
			expect(RolesHelper.toArray([])).toEqual([]);
		});

		it("should trim whitespace and lowercase each entry", () => {
			expect(RolesHelper.toArray([" Read ", "WRITE"])).toEqual(["read", "write"]);
		});

		it("should filter out entries that are blank after trimming", () => {
			expect(RolesHelper.toArray(["read", "  ", "write"])).toEqual(["read", "write"]);
		});
	});

	describe("toString", () => {
		it("should join an array into a comma-separated string", () => {
			expect(RolesHelper.toString(["read", "write"])).toBe("read,write");
		});

		it("should normalise each entry before joining", () => {
			expect(RolesHelper.toString([" Read ", "WRITE"])).toBe("read,write");
		});

		it("should return an empty string for an empty array", () => {
			expect(RolesHelper.toString([])).toBe("");
		});
	});

	describe("includes", () => {
		it("should return true when the value is present in a comma-separated string", () => {
			expect(RolesHelper.includes("user-admin,global-admin", "global-admin")).toBe(true);
		});

		it("should return false when the value is absent from the string", () => {
			expect(RolesHelper.includes("user-admin", "global-admin")).toBe(false);
		});

		it("should return false for undefined role", () => {
			expect(RolesHelper.includes(undefined, "global-admin")).toBe(false);
		});

		it("should match after normalising a mixed-case string", () => {
			expect(RolesHelper.includes("User-Admin,Global-Admin", "global-admin")).toBe(true);
		});

		it("should return true when the value is present in an array", () => {
			expect(RolesHelper.includes(["user-admin", "global-admin"], "global-admin")).toBe(true);
		});

		it("should return false when the value is absent from an array", () => {
			expect(RolesHelper.includes(["user-admin"], "global-admin")).toBe(false);
		});
	});
});
