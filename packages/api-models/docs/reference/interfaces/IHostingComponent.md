# Interface: IHostingComponent

The information about the hosting of the API.

## Extends

- `IComponent`

## Methods

### getPublicOrigin() {#getpublicorigin}

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

### getTenantOrigin() {#gettenantorigin}

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

### buildPublicUrl() {#buildpublicurl}

> **buildPublicUrl**(`url`): `Promise`\<`string`\>

Build a public url based on the public origin and the url provided.

#### Parameters

##### url

`string`

The url to build upon the public origin.

#### Returns

`Promise`\<`string`\>

The full url based on the public origin.

***

### matchesLocalOrigin() {#matcheslocalorigin}

> **matchesLocalOrigin**(`url`): `Promise`\<`string` \| `undefined`\>

Check if the origin of the given url matches the node public origin or any tenant's public origin.

#### Parameters

##### url

`string`

The url whose origin to check.

#### Returns

`Promise`\<`string` \| `undefined`\>

"node" for the node public origin, the tenant id for a tenant public origin, or undefined.
