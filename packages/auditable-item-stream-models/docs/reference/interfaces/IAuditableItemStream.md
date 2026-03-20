# Interface: IAuditableItemStream

Interface describing an auditable item stream.

## Properties

### @context {#context}

> **@context**: \[`"https://schema.twindev.org/ais/"`, `"https://schema.twindev.org/common/"`, `...IJsonLdContextDefinitionElement[]`\]

JSON-LD Context.

***

### type {#type}

> **type**: `"AuditableItemStream"`

JSON-LD Type.

***

### id {#id}

> **id**: `string`

The id of the stream.

***

### dateCreated {#datecreated}

> **dateCreated**: `string`

The date/time of when the stream was created.

***

### dateModified? {#datemodified}

> `optional` **dateModified?**: `string`

The date/time of when the stream was modified.

***

### organizationIdentity? {#organizationidentity}

> `optional` **organizationIdentity?**: `string`

The identity of the organization which controls the stream.

***

### userIdentity? {#useridentity}

> `optional` **userIdentity?**: `string`

The identity of the user who created the stream.

***

### annotationObject? {#annotationobject}

> `optional` **annotationObject?**: `IJsonLdNodeObject`

The object to associate with the entry as JSON-LD.

***

### proofId? {#proofid}

> `optional` **proofId?**: `string`

The id of the immutable proof for the stream.

***

### immutableInterval {#immutableinterval}

> **immutableInterval**: `number`

After how many entries do we add immutable checks.

***

### numberOfItems {#numberofitems}

> **numberOfItems**: `number`

How many entries are in the stream.

***

### entries? {#entries}

> `optional` **entries?**: [`IAuditableItemStreamEntry`](IAuditableItemStreamEntry.md)[]

Entries in the stream.

***

### cursor? {#cursor}

> `optional` **cursor?**: `string`

The cursor for the stream entries.

***

### verification? {#verification}

> `optional` **verification?**: `IImmutableProofVerification`

The verification of the stream.
