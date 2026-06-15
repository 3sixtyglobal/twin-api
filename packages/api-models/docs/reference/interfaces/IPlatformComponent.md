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

() => `Promise`\<`void`\>

The method to run for each tenant.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the method has been executed for all applicable tenants.
