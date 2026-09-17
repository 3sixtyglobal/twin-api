// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ITenantProcessorConfig } from "./ITenantProcessorConfig.js";

/**
 * Options for the Tenant Processor constructor.
 */
export interface ITenantProcessorConstructorOptions {
	/**
	 * The component used to resolve tenants, which also provides the lookup caching.
	 * @default tenant-admin
	 */
	tenantAdminComponentType?: string;

	/**
	 * Configuration for the processor.
	 */
	config?: ITenantProcessorConfig;
}
