// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the hosting service.
 */
export interface IHostingServiceConfig {
	/**
	 * The local origin, must be provided as a fallback e.g. http://localhost:1234.
	 */
	localOrigin: string;

	/**
	 * The APIs public base URL e.g. "https://api.example.com:1234".
	 */
	publicOrigin?: string;
}
