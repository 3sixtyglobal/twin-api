// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ITenantOverrideProcessorConfig } from "./ITenantOverrideProcessorConfig.js";

/**
 * Options for the TenantOverrideProcessor constructor.
 */
export interface ITenantOverrideProcessorConstructorOptions {
	/**
	 * The component used to resolve tenants, which also provides the lookup caching.
	 * @default tenant-admin
	 */
	tenantAdminComponentType?: string;

	/**
	 * Configuration for the processor.
	 */
	config?: ITenantOverrideProcessorConfig;
}
