# Interface: IInformationComponent

The information component for the server.

## Extends

- `IComponent`

## Methods

### root()

> **root**(): `Promise`\<`string`\>

Get the root information.

#### Returns

`Promise`\<`string`\>

The root information.

***

### info()

> **info**(): `Promise`\<[`IServerInfo`](IServerInfo.md)\>

Get the server information.

#### Returns

`Promise`\<[`IServerInfo`](IServerInfo.md)\>

The service information.

***

### favicon()

> **favicon**(): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\> \| `undefined`\>

Get the favicon.

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\> \| `undefined`\>

The favicon.

***

### spec()

> **spec**(): `Promise`\<`unknown`\>

Get the OpenAPI spec.

#### Returns

`Promise`\<`unknown`\>

The OpenAPI spec.

***

### livez()

> **livez**(): `Promise`\<`boolean`\>

Is the server live.

#### Returns

`Promise`\<`boolean`\>

True if the server is live.

***

### health()

> **health**(): `Promise`\<[`IHealthInfo`](IHealthInfo.md)\>

Get the server health.

#### Returns

`Promise`\<[`IHealthInfo`](IHealthInfo.md)\>

The service health.

***

### setComponentHealth()

> **setComponentHealth**(`name`, `status`, `details?`, `tenantId?`): `Promise`\<`void`\>

Set the status of a component.

#### Parameters

##### name

`string`

The component name.

##### status

[`HealthStatus`](../type-aliases/HealthStatus.md)

The status of the component.

##### details?

`string`

The details for the status.

##### tenantId?

`string`

The tenant id, optional if the health status is not tenant specific.

#### Returns

`Promise`\<`void`\>

Nothing.

***

### removeComponentHealth()

> **removeComponentHealth**(`name`, `tenantId?`): `Promise`\<`void`\>

Remove the status of a component.

#### Parameters

##### name

`string`

The component name.

##### tenantId?

`string`

The tenant id, optional if the health status is not tenant specific.

#### Returns

`Promise`\<`void`\>

Nothing.
