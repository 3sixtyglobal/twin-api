# Class: TenantAdminService

Service for performing email messaging operations to a connector.

## Implements

- `ITenantAdminComponent`

## Constructors

### Constructor

> **new TenantAdminService**(`options?`): `TenantAdminService`

Create a new instance of TenantAdminService.

#### Parameters

##### options?

[`ITenantAdminServiceConstructorOptions`](../interfaces/ITenantAdminServiceConstructorOptions.md)

The options for the connector.

#### Returns

`TenantAdminService`

## Properties

### CLASS\_NAME

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### className()

> **className**(): `string`

Returns the class name of the component.

#### Returns

`string`

The class name of the component.

#### Implementation of

`ITenantAdminComponent.className`

***

### get()

> **get**(`tenantId`): `Promise`\<`ITenant`\>

Get a tenant by its id.

#### Parameters

##### tenantId

`string`

The id of the tenant.

#### Returns

`Promise`\<`ITenant`\>

The tenant.

#### Throws

Error if the tenant is not found.

#### Implementation of

`ITenantAdminComponent.get`

***

### getByApiKey()

> **getByApiKey**(`apiKey`): `Promise`\<`ITenant`\>

Get a tenant by its api key.

#### Parameters

##### apiKey

`string`

The api key of the tenant.

#### Returns

`Promise`\<`ITenant`\>

The tenant.

#### Throws

Error if the tenant is not found.

#### Implementation of

`ITenantAdminComponent.getByApiKey`

***

### getByPublicOrigin()

> **getByPublicOrigin**(`publicOrigin`): `Promise`\<`ITenant`\>

Get a tenant by its public origin.

#### Parameters

##### publicOrigin

`string`

The origin of the tenant.

#### Returns

`Promise`\<`ITenant`\>

The tenant.

#### Throws

Error if the tenant is not found.

#### Implementation of

`ITenantAdminComponent.getByPublicOrigin`

***

### create()

> **create**(`tenant`): `Promise`\<`string`\>

Create a tenant.

#### Parameters

##### tenant

`Omit`\<`ITenant`, `"id"` \| `"dateCreated"` \| `"dateModified"`\> & `object`

The tenant to store.

#### Returns

`Promise`\<`string`\>

The tenant id.

#### Implementation of

`ITenantAdminComponent.create`

***

### update()

> **update**(`tenant`): `Promise`\<`void`\>

Update a tenant.

#### Parameters

##### tenant

`Partial`\<`Omit`\<`ITenant`, `"dateCreated"` \| `"dateModified"`\>\>

The tenant to update.

#### Returns

`Promise`\<`void`\>

The nothing.

#### Implementation of

`ITenantAdminComponent.update`

***

### remove()

> **remove**(`tenantId`): `Promise`\<`void`\>

Remove a tenant by its id.

#### Parameters

##### tenantId

`string`

The id of the tenant.

#### Returns

`Promise`\<`void`\>

Nothing.

#### Implementation of

`ITenantAdminComponent.remove`

***

### query()

> **query**(`options?`, `cursor?`, `limit?`): `Promise`\<\{ `tenants`: `ITenant`[]; `cursor?`: `string`; \}\>

Query tenants with pagination.

#### Parameters

##### options?

Optional query options.

###### isNodeTenant?

`boolean`

Whether to filter for node admin tenants.

##### cursor?

`string`

The cursor to start from.

##### limit?

`number`

The maximum number of tenants to return.

#### Returns

`Promise`\<\{ `tenants`: `ITenant`[]; `cursor?`: `string`; \}\>

The tenants and the next cursor if more tenants are available.

#### Implementation of

`ITenantAdminComponent.query`
