// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the TenantOverrideProcessor.
 */
export interface ITenantOverrideProcessorConfig {
	/**
	 * Include the stack with errors.
	 */
	includeErrorStack?: boolean;

	/**
	 * The scope value that grants escalated privilege for cross-tenant access. Defaults to "global-admin".
	 */
	escalatedPrivilegeScope?: string;
}
