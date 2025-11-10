// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntitySchemaFactory, EntitySchemaHelper } from "@twin.org/entity";
import { nameof } from "@twin.org/nameof";
import { Tenant } from "./entities/tenant.js";

/**
 * Initialize the schema for the node tenant processor.
 */
export function initSchema(): void {
	EntitySchemaFactory.register(nameof<Tenant>(), () => EntitySchemaHelper.getSchema(Tenant));
}
