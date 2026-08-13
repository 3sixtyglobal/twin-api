// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Type which defines the authorization for a route.
 */
export type IRouteAuthorization = string | { role: string; inherits?: string[] };
