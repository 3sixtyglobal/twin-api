// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the context id processor.
 */
export interface IContextIdProcessorConfig {
	/**
	 * The fixed identity key for request context.
	 */
	key: string;

	/**
	 * Only add the identity if the request is authenticated.
	 */
	authOnly?: boolean;
}
