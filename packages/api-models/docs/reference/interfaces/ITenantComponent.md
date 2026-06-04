# Interface: ITenantComponent

Interface for the tenant component.

## Extends

- `IComponent`

## Methods

### runPerTenant() {#runpertenant}

> **runPerTenant**(`method`): `Promise`\<`void`\>

Run a per tenant operation.

#### Parameters

##### method

() => `Promise`\<`void`\>

The method to run for each tenant.

#### Returns

`Promise`\<`void`\>

Nothing.
