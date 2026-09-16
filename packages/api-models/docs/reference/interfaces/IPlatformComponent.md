# Interface: IPlatformComponent

Interface for the platform component.

## Extends

- `IComponent`

## Methods

### isMultiTenant() {#ismultitenant}

> **isMultiTenant**(): `boolean`

Indicates whether the component is running in a multi-tenant environment.

#### Returns

`boolean`

True if the component is running in a multi-tenant environment, false otherwise.

***

### execute() {#execute}

> **execute**(`method`): `Promise`\<`void`\>

Execute a method, if single tenant will run once, if multi-tenant will run for each tenant.

#### Parameters

##### method

() => `Promise`\<`void`\> \| `Promise`\<`boolean` \| `undefined`\>

The method to run for each tenant, returning false will stop any further iterations.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the method has been executed for all applicable tenants.

***

### getLocalOriginContext() {#getlocalorigincontext}

> **getLocalOriginContext**(`url`): `Promise`\<`IContextIds` \| `undefined`\>

Get the local origin context IDs for the given URL.

#### Parameters

##### url

`string`

The URL to check.

#### Returns

`Promise`\<`IContextIds` \| `undefined`\>

A promise that resolves to the context IDs if the URL is a local origin, undefined otherwise.
