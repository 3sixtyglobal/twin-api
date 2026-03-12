# Interface: IAuditableItemStreamServiceConstructorOptions

Options for the auditable item stream service constructor.

## Properties

### immutableProofComponentType? {#immutableproofcomponenttype}

> `optional` **immutableProofComponentType**: `string`

The immutable proof component type.

***

### streamEntityStorageType? {#streamentitystoragetype}

> `optional` **streamEntityStorageType**: `string`

The entity storage for stream.

***

### streamEntryEntityStorageType? {#streamentryentitystoragetype}

> `optional` **streamEntryEntityStorageType**: `string`

The entity storage for stream entries.

***

### eventBusComponentType? {#eventbuscomponenttype}

> `optional` **eventBusComponentType**: `string`

The event bus component type, defaults to no event bus.

***

### config? {#config}

> `optional` **config**: [`IAuditableItemStreamServiceConfig`](IAuditableItemStreamServiceConfig.md)

The configuration for the connector.
