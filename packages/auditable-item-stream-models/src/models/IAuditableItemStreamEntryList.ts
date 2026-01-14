// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdContextDefinitionElement } from "@twin.org/data-json-ld";
import type { SchemaOrgContexts, SchemaOrgTypes } from "@twin.org/standards-schema-org";
import type { AuditableItemStreamContexts } from "./auditableItemStreamContexts.js";
import type { AuditableItemStreamTypes } from "./auditableItemStreamTypes.js";
import type { IAuditableItemStreamEntry } from "./IAuditableItemStreamEntry.js";

/**
 * Interface describing an auditable item stream entries list.
 */
export interface IAuditableItemStreamEntryList {
	/**
	 * JSON-LD Context.
	 */
	"@context": [
		typeof SchemaOrgContexts.Namespace,
		typeof AuditableItemStreamContexts.Namespace,
		typeof AuditableItemStreamContexts.NamespaceCommon,
		...IJsonLdContextDefinitionElement[]
	];

	/**
	 * JSON-LD Type.
	 */
	type: [typeof SchemaOrgTypes.ItemList, typeof AuditableItemStreamTypes.StreamEntryList];

	/**
	 * The entries in the stream.
	 */
	[SchemaOrgTypes.ItemListElement]: IAuditableItemStreamEntry[];

	/**
	 * Cursor for the next chunk of entries.
	 */
	[SchemaOrgTypes.NextItem]?: string;
}
