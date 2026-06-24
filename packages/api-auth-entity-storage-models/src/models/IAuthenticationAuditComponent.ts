// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@twin.org/core";
import type { AuthAuditEvent } from "./authAuditEvent.js";
import type { IAuthenticationAuditEntry } from "./IAuthenticationAuditEntry.js";

/**
 * Contract definition for authentication audit component.
 */
export interface IAuthenticationAuditComponent extends IComponent {
	/**
	 * Create a new audit entry.
	 * @param entry The audit entry to be logged.
	 * @returns The unique identifier of the created audit entry.
	 */
	create(entry: Omit<IAuthenticationAuditEntry, "id" | "dateCreated">): Promise<string>;

	/**
	 * Query the audit entries.
	 * @param options The query options.
	 * @param options.actorId The actor identifier to filter the audit entries, optional.
	 * @param options.organizationId The organization identifier to filter the audit entries, optional.
	 * @param options.tenantId The tenant identifier to filter the audit entries, optional.
	 * @param options.nodeId The node identifier to filter the audit entries, optional.
	 * @param options.event The audit event to filter the audit entries, optional.
	 * @param options.startDate The start date to filter the audit entries, optional.
	 * @param options.endDate The end date to filter the audit entries, optional.
	 * @param cursor The cursor for pagination.
	 * @param limit The maximum number of entries to return.
	 * @returns The audit entries.
	 */
	query(
		options?: {
			actorId?: string;
			organizationId?: string;
			tenantId?: string;
			nodeId?: string;
			event?: AuthAuditEvent | string;
			startDate?: string;
			endDate?: string;
		},
		cursor?: string,
		limit?: number
	): Promise<{
		entries: IAuthenticationAuditEntry[];
		cursor?: string;
	}>;
}
