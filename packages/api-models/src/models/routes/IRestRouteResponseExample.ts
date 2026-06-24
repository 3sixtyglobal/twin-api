// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IRestRouteExample } from "./IRestRouteExample.js";

/**
 * Interface which defines a REST route response example.
 */
export interface IRestRouteResponseExample<T> extends IRestRouteExample {
	/**
	 * The example response object.
	 */
	response: T;
}
