// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the static id processor.
 */
export interface IStaticContextIdProcessorConfig {
	/**
	 * The fixed identity key for request context.
	 */
	key: string;

	/**
	 * The fixed identity value for request context.
	 */
	value: string;

	/**
	 * Only add the identity if the request is authenticated.
	 */
	authOnly?: boolean;
}
