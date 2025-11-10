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
	 * Configuration for the processor.
	 */
	config?: ITenantProcessorConfig;
}
