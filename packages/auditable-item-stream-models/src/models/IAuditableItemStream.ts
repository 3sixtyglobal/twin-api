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
		typeof AuditableItemStreamContexts.ContextRoot,
		typeof AuditableItemStreamContexts.ContextRootCommon,
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
	 */
	dateCreated: string;

	/**
	 * The date/time of when the stream was modified.
	 */
	dateModified?: string;

	/**
	 * The identity of the organization which controls the stream.
	 */
	organizationIdentity?: string;

	/**
	 * The identity of the user who created the stream.
	 */
	userIdentity?: string;

	/**
	 * The object to associate with the entry as JSON-LD.
	 */
	annotationObject?: IJsonLdNodeObject;

	/**
	 * The id of the immutable proof for the stream.
	 */
	proofId?: string;

	/**
	 * After how many entries do we add immutable checks.
	 */
	immutableInterval: number;

	/**
	 * Entries in the stream.
	 */
	entries?: IAuditableItemStreamEntry[];

	/**
	 * The cursor for the stream entries.
	 */
	cursor?: string;

	/**
	 * The verification of the stream.
	 */
	verification?: IImmutableProofVerification;
}
