// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IRestRouteEntryPoint } from "@twin.org/api-models";
import { generateRestRoutesTenants, tagsTenants } from "./tenantRoutes.js";

export const restEntryPoints: IRestRouteEntryPoint[] = [
	{
		name: "tenants",
		defaultBaseRoute: "tenants",
		tags: tagsTenants,
		generateRoutes: generateRestRoutesTenants
	}
];
