// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the tenant admin service
 */
export interface ITenantAdminServiceConfig {
	/**
	 * How often the full health lifecycle (create/verify/delete) runs, in milliseconds (5 mins).
	 * @default 300000
	 */
	healthIntervalMs?: number;
}
