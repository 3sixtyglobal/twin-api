// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IBaseRouteEntryPoint } from "./IBaseRouteEntryPoint.js";
import type { ISocketRoute } from "./ISocketRoute.js";

/**
 * Route entry points are used for exposing the socket routes from a package.
 */
export type ISocketRouteEntryPoint = IBaseRouteEntryPoint<ISocketRoute>;
