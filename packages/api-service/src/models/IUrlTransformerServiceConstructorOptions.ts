// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IUrlTransformerServiceConfig } from "./IUrlTransformerServiceConfig.js";

/**
 * Options for the UrlTransformerService constructor.
 */
export interface IUrlTransformerServiceConstructorOptions {
	/**
	 * The vault connector type.
	 * @default vault
	 */
	vaultConnectorType?: string;

	/**
	 * The configuration for the service.
	 */
	config?: IUrlTransformerServiceConfig;
}
