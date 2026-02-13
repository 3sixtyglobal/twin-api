# Interface: IAuditableItemStreamEntry

Interface describing an entry for the stream.

## Properties

### @context

> **@context**: \[`"https://schema.twindev.org/ais/"`, `"https://schema.twindev.org/common/"`, `...IJsonLdContextDefinitionElement[]`\]

JSON-LD Context.

***

### type

> **type**: `"AuditableItemStreamEntry"`

JSON-LD Type.

***

### id

> **id**: `string`

The id of the entry.

***

### dateCreated

> **dateCreated**: `string`

The date/time of when the entry was created.
json-ld namespace:sch

***

### dateModified?

> `optional` **dateModified**: `string`

The date/time of when the entry was modified.
json-ld namespace:sch

***

### dateDeleted?

> `optional` **dateDeleted**: `string`

The date/time of when the entry was deleted, as we never actually remove items.
json-ld namespace:sch

***

### userIdentity?

> `optional` **userIdentity**: `string`

The identity of the user which added the entry to the stream.
json-ld namespace:twin-common

***

### entryObject

> **entryObject**: `IJsonLdNodeObject`

The object to associate with the entry as JSON-LD.
json-ld type:json

***

### index

> **index**: `number`

The index of the entry in the stream.
json-ld type:sch:Integer

***

### proofId?

> `optional` **proofId**: `string`

The id of the immutable proof.
json-ld type:sch:identifier

***

### verification?

> `optional` **verification**: `IImmutableProofVerification`

The verification of the entry.
json-ld id
