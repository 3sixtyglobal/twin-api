# Interface: IAuditableItemStream

Interface describing an auditable item stream.

## Properties

### @context

> **@context**: \[`"https://schema.twindev.org/ais/"`, `"https://schema.twindev.org/common/"`, `...IJsonLdContextDefinitionElement[]`\]

JSON-LD Context.

***

### type

> **type**: `"AuditableItemStream"`

JSON-LD Type.

***

### id

> **id**: `string`

The id of the stream.

***

### dateCreated

> **dateCreated**: `string`

The date/time of when the stream was created.
json-ld namespace:schema

***

### dateModified?

> `optional` **dateModified**: `string`

The date/time of when the stream was modified.
json-ld namespace:schema

***

### organizationIdentity?

> `optional` **organizationIdentity**: `string`

The identity of the organization which controls the stream.
json-ld namespace:twin-common

***

### userIdentity?

> `optional` **userIdentity**: `string`

The identity of the user who created the stream.
json-ld namespace:twin-common

***

### annotationObject?

> `optional` **annotationObject**: `IJsonLdNodeObject`

The object to associate with the entry as JSON-LD.
json-ld namespace:twin-common

***

### proofId?

> `optional` **proofId**: `string`

The id of the immutable proof for the stream.
json-ld type:schema:identifier

***

### immutableInterval

> **immutableInterval**: `number`

After how many entries do we add immutable checks.
json-ld type:schema:Integer

***

### entries?

> `optional` **entries**: [`IAuditableItemStreamEntry`](IAuditableItemStreamEntry.md)[]

Entries in the stream.
json-ld container:set

***

### cursor?

> `optional` **cursor**: `string`

The cursor for the stream entries.
json-ld namespace:twin-common

***

### verification?

> `optional` **verification**: `IImmutableProofVerification`

The verification of the stream.
json-ld id
