# Interface: IAuditableItemStreamComponent

Interface describing an auditable item stream component.

## Extends

- `IComponent`

## Methods

### create() {#create}

> **create**(`stream`, `options?`): `Promise`\<`string`\>

Create a new stream.

#### Parameters

##### stream

The stream to create.

###### annotationObject?

`IJsonLdNodeObject`

The object for the stream as JSON-LD.

###### entries?

`object`[]

Entries to store in the stream.

##### options?

Options for creating the stream.

###### immutableInterval?

`number`

After how many entries do we add immutable checks, defaults to service configured value.
A value of 0 will disable immutable checks, 1 will be every item, or any other integer for an interval.

#### Returns

`Promise`\<`string`\>

The id of the new stream item.

***

### update() {#update}

> **update**(`stream`): `Promise`\<`void`\>

Update a stream.

#### Parameters

##### stream

The stream to update.

###### id

`string`

The id of the stream to update.

###### annotationObject?

`IJsonLdNodeObject`

The object for the stream as JSON-LD.

#### Returns

`Promise`\<`void`\>

Nothing.

***

### get() {#get}

> **get**(`id`, `options?`): `Promise`\<[`IAuditableItemStream`](IAuditableItemStream.md)\>

Get a stream header without the entries.

#### Parameters

##### id

`string`

The id of the stream to get.

##### options?

Additional options for the get operation.

###### includeEntries?

`boolean`

Whether to include the entries, defaults to false.

###### includeDeleted?

`boolean`

Whether to include deleted entries, defaults to false.

###### verifyStream?

`boolean`

Should the stream be verified, defaults to false.

###### verifyEntries?

`boolean`

Should the entries be verified, defaults to false.

#### Returns

`Promise`\<[`IAuditableItemStream`](IAuditableItemStream.md)\>

The stream and entries if found.

#### Throws

NotFoundError if the stream is not found.

***

### remove() {#remove}

> **remove**(`id`): `Promise`\<`void`\>

Delete the stream.

#### Parameters

##### id

`string`

The id of the stream to remove.

#### Returns

`Promise`\<`void`\>

Nothing.

***

### query() {#query}

> **query**(`conditions?`, `orderBy?`, `orderByDirection?`, `properties?`, `cursor?`, `limit?`): `Promise`\<\{ `entries`: [`IAuditableItemStreamList`](IAuditableItemStreamList.md); `cursor?`: `string`; \}\>

Query all the streams, will not return entries.

#### Parameters

##### conditions?

`IComparator`[]

Conditions to use in the query.

##### orderBy?

The order for the results, defaults to created.

`"dateCreated"` | `"dateModified"`

##### orderByDirection?

`SortDirection`

The direction for the order, defaults to descending.

##### properties?

keyof [`IAuditableItemStream`](IAuditableItemStream.md)[]

The properties to return, if not provided defaults to id, dateCreated, dateModified and annotationObject.

##### cursor?

`string`

The cursor to request the next chunk of entities.

##### limit?

`number`

Limit the number of entities to return.

#### Returns

`Promise`\<\{ `entries`: [`IAuditableItemStreamList`](IAuditableItemStreamList.md); `cursor?`: `string`; \}\>

The entities, which can be partial if a limited keys list was provided.

***

### createEntry() {#createentry}

> **createEntry**(`streamId`, `entryObject`): `Promise`\<`string`\>

Create an entry in the stream.

#### Parameters

##### streamId

`string`

The id of the stream to create the entry in.

##### entryObject

`IJsonLdNodeObject`

The object for the stream as JSON-LD.

#### Returns

`Promise`\<`string`\>

The id of the created entry, if not provided.

***

### getEntry() {#getentry}

> **getEntry**(`streamId`, `entryId`, `options?`): `Promise`\<[`IAuditableItemStreamEntry`](IAuditableItemStreamEntry.md)\>

Get the entry from the stream.

#### Parameters

##### streamId

`string`

The id of the stream to get.

##### entryId

`string`

The id of the stream entry to get.

##### options?

Additional options for the get operation.

###### verifyEntry?

`boolean`

Should the entry be verified, defaults to false.

#### Returns

`Promise`\<[`IAuditableItemStreamEntry`](IAuditableItemStreamEntry.md)\>

The stream and entries if found.

#### Throws

NotFoundError if the stream is not found.

***

### getEntryObject() {#getentryobject}

> **getEntryObject**(`id`, `entryId`): `Promise`\<`IJsonLdNodeObject`\>

Get the entry object from the stream.

#### Parameters

##### id

`string`

The id of the stream to get.

##### entryId

`string`

The id of the stream entry to get.

#### Returns

`Promise`\<`IJsonLdNodeObject`\>

The stream and entries if found.

#### Throws

NotFoundError if the stream is not found.

***

### updateEntry() {#updateentry}

> **updateEntry**(`streamId`, `entryId`, `entryObject`): `Promise`\<`void`\>

Update an entry in the stream.

#### Parameters

##### streamId

`string`

The id of the stream to update.

##### entryId

`string`

The id of the entry to update.

##### entryObject

`IJsonLdNodeObject`

The object for the entry as JSON-LD.

#### Returns

`Promise`\<`void`\>

Nothing.

***

### removeEntry() {#removeentry}

> **removeEntry**(`streamId`, `entryId`): `Promise`\<`void`\>

Remove from the stream.

#### Parameters

##### streamId

`string`

The id of the stream to remove from.

##### entryId

`string`

The id of the entry to delete.

#### Returns

`Promise`\<`void`\>

Nothing.

***

### getEntries() {#getentries}

> **getEntries**(`streamId?`, `options?`): `Promise`\<\{ `entries`: [`IAuditableItemStreamEntryList`](IAuditableItemStreamEntryList.md); `cursor?`: `string`; \}\>

Get the entries for the stream.

#### Parameters

##### streamId?

`string`

The id of the stream to get, if undefined returns all matching entries.

##### options?

Additional options for the get operation.

###### conditions?

`IComparator`[]

The conditions to filter the stream.

###### includeDeleted?

`boolean`

Whether to include deleted entries, defaults to false.

###### verifyEntries?

`boolean`

Should the entries be verified, defaults to false.

###### limit?

`number`

How many entries to return.

###### cursor?

`string`

Cursor to use for next chunk of data.

###### order?

`SortDirection`

Retrieve the entries in ascending/descending time order, defaults to Ascending.

#### Returns

`Promise`\<\{ `entries`: [`IAuditableItemStreamEntryList`](IAuditableItemStreamEntryList.md); `cursor?`: `string`; \}\>

The stream and entries if found.

#### Throws

NotFoundError if the stream is not found.

***

### getEntryObjects() {#getentryobjects}

> **getEntryObjects**(`streamId?`, `options?`): `Promise`\<\{ `entries`: [`IAuditableItemStreamEntryObjectList`](IAuditableItemStreamEntryObjectList.md); `cursor?`: `string`; \}\>

Get the entry objects for the stream.

#### Parameters

##### streamId?

`string`

The id of the stream to get, if undefined returns all matching entries.

##### options?

Additional options for the get operation.

###### conditions?

`IComparator`[]

The conditions to filter the stream.

###### includeDeleted?

`boolean`

Whether to include deleted entries, defaults to false.

###### limit?

`number`

How many entries to return.

###### cursor?

`string`

Cursor to use for next chunk of data.

###### order?

`SortDirection`

Retrieve the entries in ascending/descending time order, defaults to Ascending.

#### Returns

`Promise`\<\{ `entries`: [`IAuditableItemStreamEntryObjectList`](IAuditableItemStreamEntryObjectList.md); `cursor?`: `string`; \}\>

The stream and entries if found.

#### Throws

NotFoundError if the stream is not found.

***

### removeVerifiable() {#removeverifiable}

> **removeVerifiable**(`streamId`): `Promise`\<`void`\>

Remove the verifiable storage for the stream and entries.

#### Parameters

##### streamId

`string`

The id of the stream to remove the storage from.

#### Returns

`Promise`\<`void`\>

Nothing.

#### Throws

NotFoundError if the vertex is not found.
