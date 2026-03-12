# Class: HostingService

The hosting service for the server.

## Implements

- `IHostingComponent`

## Constructors

### Constructor

> **new HostingService**(`options`): `HostingService`

Create a new instance of HostingService.

#### Parameters

##### options

[`IHostingServiceConstructorOptions`](../interfaces/IHostingServiceConstructorOptions.md)

The options to create the service.

#### Returns

`HostingService`

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

`IHostingComponent.className`

***

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

#### Implementation of

`IHostingComponent.getPublicOrigin`

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

#### Implementation of

`IHostingComponent.getTenantOrigin`

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

#### Implementation of

`IHostingComponent.buildPublicUrl`
