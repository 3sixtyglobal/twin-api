# Class: TenantService

Service for performing tenant administration operations.

## Implements

- `ITenantComponent`

## Constructors

### Constructor

> **new TenantService**(`options?`): `TenantService`

Create a new instance of TenantService.

#### Parameters

##### options?

[`ITenantAdminServiceConstructorOptions`](../interfaces/ITenantAdminServiceConstructorOptions.md)

The options for the connector.

#### Returns

`TenantService`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### className() {#classname}

> **className**(): `string`

Returns the class name of the component.

#### Returns

`string`

The class name of the component.

#### Implementation of

`ITenantComponent.className`

***

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

#### Implementation of

`ITenantComponent.runPerTenant`
