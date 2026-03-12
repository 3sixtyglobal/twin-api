# Interface: IEntityStorageAuthenticationServiceConfig

Configuration for the entity storage authentication service.

## Properties

### signingKeyName? {#signingkeyname}

> `optional` **signingKeyName**: `string`

The name of the key to retrieve from the vault for signing JWT.

***

### defaultTtlMinutes? {#defaultttlminutes}

> `optional` **defaultTtlMinutes**: `number`

The default time to live for the JWT.
