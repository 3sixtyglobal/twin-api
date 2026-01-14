// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { DataTypeHandlerFactory, type IJsonSchema } from "@twin.org/data-core";
import { AuditableItemStreamContexts } from "../models/auditableItemStreamContexts.js";
import { AuditableItemStreamTypes } from "../models/auditableItemStreamTypes.js";
import AuditableItemStreamSchema from "../schemas/AuditableItemStream.json" with { type: "json" };
import AuditableItemStreamEntrySchema from "../schemas/AuditableItemStreamEntry.json" with { type: "json" };
import AuditableItemStreamEntryListSchema from "../schemas/AuditableItemStreamEntryList.json" with { type: "json" };
import AuditableItemStreamEntryObjectListSchema from "../schemas/AuditableItemStreamEntryObjectList.json" with { type: "json" };
import AuditableItemStreamListSchema from "../schemas/AuditableItemStreamList.json" with { type: "json" };

/**
 * Handle all the data types for auditable item stream.
 */
export class AuditableItemStreamDataTypes {
	/**
	 * Register all the data types.
	 */
	public static registerTypes(): void {
		DataTypeHandlerFactory.register(
			`${AuditableItemStreamContexts.Namespace}${AuditableItemStreamTypes.Stream}`,
			() => ({
				namespace: AuditableItemStreamContexts.Namespace,
				type: AuditableItemStreamTypes.Stream,
				defaultValue: {},
				jsonSchema: async () => AuditableItemStreamSchema as IJsonSchema
			})
		);
		DataTypeHandlerFactory.register(
			`${AuditableItemStreamContexts.Namespace}${AuditableItemStreamTypes.StreamList}`,
			() => ({
				namespace: AuditableItemStreamContexts.Namespace,
				type: AuditableItemStreamTypes.StreamList,
				defaultValue: {},
				jsonSchema: async () => AuditableItemStreamListSchema as IJsonSchema
			})
		);
		DataTypeHandlerFactory.register(
			`${AuditableItemStreamContexts.Namespace}${AuditableItemStreamTypes.StreamEntry}`,
			() => ({
				namespace: AuditableItemStreamContexts.Namespace,
				type: AuditableItemStreamTypes.StreamEntry,
				defaultValue: {},
				jsonSchema: async () => AuditableItemStreamEntrySchema as IJsonSchema
			})
		);
		DataTypeHandlerFactory.register(
			`${AuditableItemStreamContexts.Namespace}${AuditableItemStreamTypes.StreamEntryList}`,
			() => ({
				namespace: AuditableItemStreamContexts.Namespace,
				type: AuditableItemStreamTypes.StreamEntryList,
				defaultValue: {},
				jsonSchema: async () => AuditableItemStreamEntryListSchema as IJsonSchema
			})
		);

		DataTypeHandlerFactory.register(
			`${AuditableItemStreamContexts.Namespace}${AuditableItemStreamTypes.StreamEntryObjectList}`,
			() => ({
				namespace: AuditableItemStreamContexts.Namespace,
				type: AuditableItemStreamTypes.StreamEntryObjectList,
				defaultValue: {},
				jsonSchema: async () => AuditableItemStreamEntryObjectListSchema as IJsonSchema
			})
		);
	}
}
