// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the platform service
 */
export interface IPlatformServiceConfig {
	/**
	 * Indicates whether the service is running in a multi-tenant environment.
	 * @default false
	 */
	isMultiTenant?: boolean;
}
