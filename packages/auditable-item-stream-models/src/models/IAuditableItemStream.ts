// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdContextDefinitionElement, IJsonLdNodeObject } from "@twin.org/data-json-ld";
import type { IImmutableProofVerification } from "@twin.org/immutable-proof-models";
import type { AuditableItemStreamContexts } from "./auditableItemStreamContexts.js";
import type { AuditableItemStreamTypes } from "./auditableItemStreamTypes.js";
import type { IAuditableItemStreamEntry } from "./IAuditableItemStreamEntry.js";

/**
 * Interface describing an auditable item stream.
 */
export interface IAuditableItemStream {
	/**
	 * JSON-LD Context.
	 */
	"@context": [
		typeof AuditableItemStreamContexts.Context,
		typeof AuditableItemStreamContexts.ContextCommon,
		...IJsonLdContextDefinitionElement[]
	];

	/**
	 * JSON-LD Type.
	 */
	type: typeof AuditableItemStreamTypes.Stream;

	/**
	 * The id of the stream.
	 */
	id: string;

	/**
	 * The date/time of when the stream was created.
	 * json-ld namespace:sch
	 */
	dateCreated: string;

	/**
	 * The date/time of when the stream was modified.
	 * json-ld namespace:sch
	 */
	dateModified?: string;

	/**
	 * The identity of the organization which controls the stream.
	 * json-ld namespace:twin-common
	 */
	organizationIdentity?: string;

	/**
	 * The identity of the user who created the stream.
	 * json-ld namespace:twin-common
	 */
	userIdentity?: string;

	/**
	 * The object to associate with the entry as JSON-LD.
	 * json-ld namespace:twin-common
	 */
	annotationObject?: IJsonLdNodeObject;

	/**
	 * The id of the immutable proof for the stream.
	 * json-ld type:sch:identifier
	 */
	proofId?: string;

	/**
	 * After how many entries do we add immutable checks.
	 * json-ld type:sch:Integer
	 */
	immutableInterval: number;

	/**
	 * How many entries are in the stream.
	 * json-ld id:sch:numberOfItems
	 */
	numberOfItems: number;

	/**
	 * Entries in the stream.
	 * json-ld container:set
	 */
	entries?: IAuditableItemStreamEntry[];

	/**
	 * The cursor for the stream entries.
	 * json-ld namespace:twin-common
	 */
	cursor?: string;

	/**
	 * The verification of the stream.
	 * json-ld id
	 */
	verification?: IImmutableProofVerification;
}
