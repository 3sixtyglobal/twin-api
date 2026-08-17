// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ITenantOverrideProcessorConfig } from "./ITenantOverrideProcessorConfig.js";

/**
 * Options for the TenantOverrideProcessor constructor.
 */
export interface ITenantOverrideProcessorConstructorOptions {
	/**
	 * The entity storage for the tenants.
	 * @default tenant
	 */
	tenantEntityStorageType?: string;

	/**
	 * Configuration for the processor.
	 */
	config?: ITenantOverrideProcessorConfig;
}
