# Interface: IAuditableItemStreamBase

Interface describing an auditable item stream.

## Extended by

- [`IAuditableItemStream`](IAuditableItemStream.md)

## Properties

### @context {#context}

> **@context**: \[`"https://schema.org"`, `"https://schema.twindev.org/ais/"`, `"https://schema.twindev.org/common/"`, `...IJsonLdContextDefinitionElement[]`\]

JSON-LD Context.

***

### type {#type}

> **type**: `"AuditableItemStream"`

JSON-LD Type.

***

### annotationObject? {#annotationobject}

> `optional` **annotationObject?**: `IJsonLdNodeObject`

The object to associate with the entry as JSON-LD.

***

### entries? {#entries}

> `optional` **entries?**: `object`

Entries in the stream.

#### type

> **type**: `"ItemList"`

#### itemListElement

> **itemListElement**: [`IAuditableItemStreamEntryBase`](IAuditableItemStreamEntryBase.md)[]

***

### immutableInterval? {#immutableinterval}

> `optional` **immutableInterval?**: `number`

After how many entries do we add immutable checks, defaults to service configured value.
A value of 0 will disable immutable checks, 1 will be every item, or any other integer for an interval.
