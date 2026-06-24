# Interface: IAuthenticationAuditComponent

Contract definition for authentication audit component.

## Extends

- `IComponent`

## Methods

### create() {#create}

> **create**(`entry`): `Promise`\<`string`\>

Create a new audit entry.

#### Parameters

##### entry

`Omit`\<[`IAuthenticationAuditEntry`](IAuthenticationAuditEntry.md), `"id"` \| `"dateCreated"`\>

The audit entry to be logged.

#### Returns

`Promise`\<`string`\>

The unique identifier of the created audit entry.

***

### query() {#query}

> **query**(`options?`, `cursor?`, `limit?`): `Promise`\<\{ `entries`: [`IAuthenticationAuditEntry`](IAuthenticationAuditEntry.md)[]; `cursor?`: `string`; \}\>

Query the audit entries.

#### Parameters

##### options?

The query options.

###### actorId?

`string`

The actor identifier to filter the audit entries, optional.

###### organizationId?

`string`

The organization identifier to filter the audit entries, optional.

###### tenantId?

`string`

The tenant identifier to filter the audit entries, optional.

###### nodeId?

`string`

The node identifier to filter the audit entries, optional.

###### event?

`string`

The audit event to filter the audit entries, optional.

###### startDate?

`string`

The start date to filter the audit entries, optional.

###### endDate?

`string`

The end date to filter the audit entries, optional.

##### cursor?

`string`

The cursor for pagination.

##### limit?

`number`

The maximum number of entries to return.

#### Returns

`Promise`\<\{ `entries`: [`IAuthenticationAuditEntry`](IAuthenticationAuditEntry.md)[]; `cursor?`: `string`; \}\>

The audit entries.
