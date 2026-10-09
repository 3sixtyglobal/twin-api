// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Is } from "@3sixty/core";

/**
 * Helper methods for working with scope values stored as comma-separated strings.
 */
export class ScopeHelper {
	/**
	 * Converts a scope value to a normalised lowercase array. Accepts either a comma-separated
	 * string or an already-split array, so callers do not need to branch on input type.
	 * Returns an empty array for an empty or undefined input.
	 * @param scope The comma-separated scope string, or an array of scope entries.
	 * @returns The scope entries as a trimmed, lowercase array.
	 */
	public static toArray(scope: string | string[] | undefined): string[] {
		if (Array.isArray(scope)) {
			return scope.map(s => s.trim().toLocaleLowerCase()).filter(s => s.length > 0);
		}
		if (!Is.stringValue(scope)) {
			return [];
		}
		return scope
			.split(",")
			.map(s => s.trim().toLocaleLowerCase())
			.filter(s => s.length > 0);
	}

	/**
	 * Joins a scope array into a normalised comma-separated string, trimming and lowercasing each entry.
	 * @param scopes The scope entries to join.
	 * @returns The comma-separated scope string.
	 */
	public static toString(scopes: string[]): string {
		return scopes.map(s => s.trim().toLocaleLowerCase()).join(",");
	}

	/**
	 * Returns true if the scope includes the specified value. Accepts either a
	 * comma-separated string or an array, matching the input forms accepted by toArray.
	 * @param scope The comma-separated scope string or array to search.
	 * @param value The scope value to look for.
	 * @returns True when value is present in the scope.
	 */
	public static includes(scope: string | string[] | undefined, value: string): boolean {
		return ScopeHelper.toArray(scope).includes(value);
	}
}
