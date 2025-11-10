// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IBaseRouteEntryPoint } from "./IBaseRouteEntryPoint.js";
import type { IRestRoute } from "./IRestRoute.js";

/**
 * Route entry points are used for exposing the REST routes from a package.
 */
export type IRestRouteEntryPoint = IBaseRouteEntryPoint<IRestRoute>;
