// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HttpParameterHelper } from "../../src/helpers/httpParameterHelper.js";

describe("HttpParameterHelper", () => {
	describe("arrayFromString", () => {
		it("should return undefined when input is undefined", () => {
			expect(HttpParameterHelper.arrayFromString(undefined)).toBeUndefined();
		});

		it("should split a comma-separated string into an array", () => {
			expect(HttpParameterHelper.arrayFromString("a,b,c")).toEqual(["a", "b", "c"]);
		});

		it("should return a single-element array for a string with no commas", () => {
			expect(HttpParameterHelper.arrayFromString("only")).toEqual(["only"]);
		});

		it("should preserve whitespace in values", () => {
			expect(HttpParameterHelper.arrayFromString("a, b")).toEqual(["a", " b"]);
		});
	});

	describe("arrayToString", () => {
		it("should return undefined when input is undefined", () => {
			expect(HttpParameterHelper.arrayToString(undefined)).toBeUndefined();
		});

		it("should join array elements with commas", () => {
			expect(HttpParameterHelper.arrayToString(["a", "b", "c"])).toBe("a,b,c");
		});

		it("should return a plain string for a single-element array", () => {
			expect(HttpParameterHelper.arrayToString(["only"])).toBe("only");
		});
	});

	describe("objectFromString", () => {
		it("should return undefined when input is undefined", () => {
			expect(HttpParameterHelper.objectFromString(undefined)).toBeUndefined();
		});

		it("should parse a valid JSON string into an object", () => {
			expect(HttpParameterHelper.objectFromString('{"key":"value"}')).toEqual({ key: "value" });
		});

		it("should return undefined for an invalid JSON string", () => {
			expect(HttpParameterHelper.objectFromString("not-json")).toBeUndefined();
		});

		it("should parse a JSON array", () => {
			expect(HttpParameterHelper.objectFromString("[1,2,3]")).toEqual([1, 2, 3]);
		});
	});

	describe("objectToString", () => {
		it("should return undefined when input is undefined", () => {
			expect(HttpParameterHelper.objectToString(undefined)).toBeUndefined();
		});

		it("should return undefined when input is null", () => {
			expect(HttpParameterHelper.objectToString(null)).toBeUndefined();
		});

		it("should serialize an object to a JSON string", () => {
			expect(HttpParameterHelper.objectToString({ key: "value" })).toBe('{"key":"value"}');
		});

		it("should serialize an array to a JSON string", () => {
			expect(HttpParameterHelper.objectToString([1, 2, 3])).toBe("[1,2,3]");
		});
	});
});
