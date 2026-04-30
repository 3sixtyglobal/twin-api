// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ITenantProcessorConfig } from "./ITenantProcessorConfig.js";

/**
 * Options for the Tenant Processor constructor.
 */
export interface ITenantProcessorConstructorOptions {
	/**
	 * The entity storage for the tenants.
	 * @default tenant
	 */
	tenantEntityStorageType?: string;

	/**
	 * The vault connector used to decrypt tenant tokens. Only resolved when
	 * `config.signingKeyName` is set.
	 * @default vault
	 */
	vaultConnectorType?: string;

	/**
	 * Configuration for the processor.
	 */
	config?: ITenantProcessorConfig;
}
