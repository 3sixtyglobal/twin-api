// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ISingleTenantProcessorConfig } from "./ISingleTenantProcessorConfig.js";

/**
 * Options for the Single Tenant Processor constructor.
 */
export interface ISingleTenantProcessorConstructorOptions {
	/**
	 * Configuration for the processor.
	 */
	config?: ISingleTenantProcessorConfig;
}
