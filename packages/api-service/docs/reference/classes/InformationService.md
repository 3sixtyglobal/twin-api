# Class: InformationService

The information service for the server.

## Implements

- `IInformationComponent`

## Constructors

### Constructor

> **new InformationService**(`options`): `InformationService`

Create a new instance of InformationService.

#### Parameters

##### options

[`IInformationServiceConstructorOptions`](../interfaces/IInformationServiceConstructorOptions.md)

The options to create the service.

#### Returns

`InformationService`

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

`IInformationComponent.className`

***

### start() {#start}

> **start**(): `Promise`\<`void`\>

The service needs to be started when the application is initialized.

#### Returns

`Promise`\<`void`\>

Nothing.

#### Implementation of

`IInformationComponent.start`

***

### root() {#root}

> **root**(): `Promise`\<`string`\>

Get the root information.

#### Returns

`Promise`\<`string`\>

The root information.

#### Implementation of

`IInformationComponent.root`

***

### info() {#info}

> **info**(): `Promise`\<`IServerInfo`\>

Get the server information.

#### Returns

`Promise`\<`IServerInfo`\>

The service information.

#### Implementation of

`IInformationComponent.info`

***

### favicon() {#favicon}

> **favicon**(): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\> \| `undefined`\>

Get the favicon.

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\> \| `undefined`\>

The favicon.

#### Implementation of

`IInformationComponent.favicon`

***

### spec() {#spec}

> **spec**(): `Promise`\<`unknown`\>

Get the OpenAPI spec.

#### Returns

`Promise`\<`unknown`\>

The OpenAPI spec.

#### Implementation of

`IInformationComponent.spec`

***

### livez() {#livez}

> **livez**(): `Promise`\<`boolean`\>

Is the server live.

#### Returns

`Promise`\<`boolean`\>

True if the server is live.

#### Implementation of

`IInformationComponent.livez`

***

### health() {#health}

> **health**(): `Promise`\<`IHealthInfo`\>

Get the server health.

#### Returns

`Promise`\<`IHealthInfo`\>

The service health.

#### Implementation of

`IInformationComponent.health`

***

### setComponentHealth() {#setcomponenthealth}

> **setComponentHealth**(`name`, `status`, `details?`, `tenantId?`): `Promise`\<`void`\>

Set the status of a component.

#### Parameters

##### name

`string`

The component name.

##### status

`HealthStatus`

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

#### Implementation of

`IInformationComponent.setComponentHealth`

***

### removeComponentHealth() {#removecomponenthealth}

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

#### Implementation of

`IInformationComponent.removeComponentHealth`
