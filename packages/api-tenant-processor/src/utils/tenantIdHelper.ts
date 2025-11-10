// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, RandomHelper } from "@twin.org/core";

/**
 * Helper class for tenant id related operations.
 */
export class TenantIdHelper {
	/**
	 * Generates a new tenant ID.
	 * @returns A new tenant ID.
	 */
	public static generateTenantId(): string {
		return Converter.bytesToHex(RandomHelper.generate(16));
	}

	/**
	 * Generates a new API Key.
	 * @returns A new API Key.
	 */
	public static generateApiKey(): string {
		return Converter.bytesToHex(RandomHelper.generate(16));
	}
}
