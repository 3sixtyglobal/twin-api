// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IContextIdHandler } from "@twin.org/context";
import { Converter, Guards } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";

/**
 * Context ID handler that treats a tenant ID as a compact base64url-encoded hex string.
 */
export class TenantIdContextIdHandler implements IContextIdHandler {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<TenantIdContextIdHandler>();

	/**
	 * The class name of the component.
	 * @returns The class name.
	 */
	public className(): string {
		return TenantIdContextIdHandler.CLASS_NAME;
	}

	/**
	 * The short form of the tenant id is the base64 version to compact.
	 * @param value The full context id value.
	 * @returns Short form string.
	 */
	public short(value: string): string {
		return Converter.bytesToBase64Url(Converter.hexToBytes(value));
	}

	/**
	 * Guard the value ensuring length.
	 * @param value The value to guard.
	 * @throws GeneralError if the value is too short.
	 */
	public guard(value: string): void {
		Guards.stringHexLength(TenantIdContextIdHandler.CLASS_NAME, nameof(value), value, 32);
	}
}
