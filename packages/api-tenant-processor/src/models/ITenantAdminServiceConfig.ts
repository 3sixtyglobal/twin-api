// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the tenant admin service.
 */
export interface ITenantAdminServiceConfig {
	/**
	 * The time in milliseconds a tenant is kept in the in-memory lookup cache, counted from when it
	 * was read and not extended by use, set to 0 to disable caching. Entries are invalidated when a
	 * tenant is created, updated or removed through this service, but only in the process that made
	 * the change, so this is also the longest another node can serve a tenant that has been edited
	 * elsewhere.
	 * @default 30000
	 */
	tenantCacheTtlMs?: number;

	/**
	 * The maximum number of tenant lookups to hold in the in-memory cache.
	 * @default undefined (LfuCache default)
	 */
	tenantCacheCapacity?: number;

	/**
	 * Maximum time in milliseconds to wait for the tenant cache mutex during a cache population.
	 * @default undefined (LfuCache default)
	 */
	tenantCacheMutexTimeoutMs?: number;
}
