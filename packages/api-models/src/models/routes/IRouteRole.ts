// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Type which defines the default authorization roles for a route used to seed the RBAC rules.
 */
export type IRouteRole = string | { role: string; inherits?: string[] };
