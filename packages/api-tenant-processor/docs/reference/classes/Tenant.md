# Class: Tenant

Class defining the storage for node tenants.

## Constructors

### Constructor

> **new Tenant**(): `Tenant`

#### Returns

`Tenant`

## Properties

### id

> **id**: `string`

The unique identifier for the tenant.

***

### apiKey

> **apiKey**: `string`

The api key for the tenant.

***

### label

> **label**: `string`

The label of the tenant.

***

### dateCreated

> **dateCreated**: `string`

The date the tenant was created.

***

### publicOrigin?

> `optional` **publicOrigin**: `string`

The origin available to the public for accessing the API.

***

### isNodeTenant

> **isNodeTenant**: `boolean`

Indicates whether the tenant is the node tenant.
