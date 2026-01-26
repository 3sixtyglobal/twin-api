# Interface: IHostingComponent

The information about the hosting of the API.

## Extends

- `IComponent`

## Methods

### getPublicOrigin()

> **getPublicOrigin**(`serverRequestUrl?`): `Promise`\<`string`\>

Get the public origin for the hosting.

#### Parameters

##### serverRequestUrl?

`string`

The url of the current server request if there is one.

#### Returns

`Promise`\<`string`\>

The public origin.

***

### getTenantOrigin()

> **getTenantOrigin**(`tenantId`): `Promise`\<`string` \| `undefined`\>

Get the public origin for the tenant if one exists.

#### Parameters

##### tenantId

`string`

The tenant identifier.

#### Returns

`Promise`\<`string` \| `undefined`\>

The public origin for the tenant.

***

### buildPublicUrl()

> **buildPublicUrl**(`url`): `Promise`\<`string`\>

Build a public url based on the public origin and the url provided.

#### Parameters

##### url

`string`

The url to build upon the public origin.

#### Returns

`Promise`\<`string`\>

The full url based on the public origin.
