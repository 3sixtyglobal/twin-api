// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IRouteAuthorization } from "./IRouteAuthorization.js";

/**
 * Interface which defines a route.
 */
export interface IBaseRoute {
	/**
	 * The id of the operation.
	 */
	operationId: string;

	/**
	 * The path to use for routing.
	 */
	path: string;

	/**
	 * Skips the authentication requirement for this route.
	 */
	skipAuth?: boolean;

	/**
	 * Skips the tenant requirement for this route.
	 */
	skipTenant?: boolean;

	/**
	 * Requires authorization for this route.
	 * @default false
	 */
	requiresAuthorization?: boolean;

	/**
	 * The default roles which can access this route, used to bootstrap authorization.
	 */
	defaultAuthorizationRoles?: IRouteAuthorization[];
}
