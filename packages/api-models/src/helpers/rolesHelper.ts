// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Is } from "@twin.org/core";

/**
 * Helper methods for working with role values stored as comma-separated strings.
 */
export class RolesHelper {
	/**
	 * Converts a role value to a normalised lowercase array. Accepts either a comma-separated
	 * string or an already-split array, so callers do not need to branch on input type.
	 * Returns an empty array for an empty or undefined input.
	 * @param roles The comma-separated roles string, or an array of role entries.
	 * @returns The role entries as a trimmed, lowercase array.
	 */
	public static toArray(roles: string | string[] | undefined): string[] {
		if (Array.isArray(roles)) {
			return roles.map(s => s.trim().toLocaleLowerCase()).filter(s => s.length > 0);
		}
		if (!Is.stringValue(roles)) {
			return [];
		}
		return roles
			.split(",")
			.map(s => s.trim().toLocaleLowerCase())
			.filter(s => s.length > 0);
	}

	/**
	 * Joins a role array into a normalised comma-separated string, trimming and lowercasing each entry.
	 * @param roles The role entries to join.
	 * @returns The comma-separated roles string.
	 */
	public static toString(roles: string[]): string {
		return roles.map(s => s.trim().toLocaleLowerCase()).join(",");
	}

	/**
	 * Returns true if the roles include the specified value. Accepts either a
	 * comma-separated string or an array, matching the input forms accepted by toArray.
	 * @param roles The comma-separated roles string or array to search.
	 * @param value The role value to look for.
	 * @returns True when value is present in the roles.
	 */
	public static includes(roles: string | string[] | undefined, value: string): boolean {
		return RolesHelper.toArray(roles).includes(value);
	}
}
