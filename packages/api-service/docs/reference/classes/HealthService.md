# Class: HealthService

The health service for the server.

## Implements

- `IHealthComponent`

## Constructors

### Constructor

> **new HealthService**(`options?`): `HealthService`

Create a new instance of HealthService.

#### Parameters

##### options?

[`IHealthServiceConstructorOptions`](../interfaces/IHealthServiceConstructorOptions.md)

The constructor options.

#### Returns

`HealthService`

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

`IHealthComponent.className`

***

### start() {#start}

> **start**(`nodeLoggingComponentType?`): `Promise`\<`void`\>

The component needs to be started when the node is initialized.

#### Parameters

##### nodeLoggingComponentType?

`string`

The node logging component type.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the initial health check timer has been scheduled.

#### Implementation of

`IHealthComponent.start`

***

### stop() {#stop}

> **stop**(`nodeLoggingComponentType?`): `Promise`\<`void`\>

The component needs to be stopped when the node is closed.

#### Parameters

##### nodeLoggingComponentType?

`string`

The node logging component type.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the health check timer has been cancelled.

#### Implementation of

`IHealthComponent.stop`

***

### healthStatus() {#healthstatus}

> **healthStatus**(): `Promise`\<\{ `status`: `HealthStatus`; `components`: `IHealth`[]; \}\>

Get the server health.

#### Returns

`Promise`\<\{ `status`: `HealthStatus`; `components`: `IHealth`[]; \}\>

The service health.

#### Implementation of

`IHealthComponent.healthStatus`
