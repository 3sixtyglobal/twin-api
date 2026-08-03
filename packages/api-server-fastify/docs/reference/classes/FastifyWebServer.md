# Class: FastifyWebServer

Implementation of the web server using Fastify.

## Implements

- `IWebServer`\<`FastifyInstance`\>
- `IHealthProviderComponent`

## Constructors

### Constructor

> **new FastifyWebServer**(`options?`): `FastifyWebServer`

Create a new instance of FastifyWebServer.

#### Parameters

##### options?

[`IFastifyWebServerConstructorOptions`](../interfaces/IFastifyWebServerConstructorOptions.md)

The options for the server.

#### Returns

`FastifyWebServer`

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

`IWebServer.className`

***

### getInstance() {#getinstance}

> **getInstance**(): `FastifyInstance`

Get the web server instance.

#### Returns

`FastifyInstance`

The web server instance.

#### Implementation of

`IWebServer.getInstance`

***

### build() {#build}

> **build**(`restRouteProcessors?`, `restRoutes?`, `socketRouteProcessors?`, `socketRoutes?`, `options?`): `Promise`\<`void`\>

Build the server.

#### Parameters

##### restRouteProcessors?

`IRestRouteProcessor`[]

The processors for incoming requests over REST.

##### restRoutes?

`IRestRoute`\<`any`, `any`\>[]

The REST routes.

##### socketRouteProcessors?

`ISocketRouteProcessor`[]

The processors for incoming requests over Sockets.

##### socketRoutes?

`ISocketRoute`\<`any`, `any`\>[]

The socket routes.

##### options?

`IWebServerOptions`

Options for building the server.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the server is fully built and ready to start.

#### Implementation of

`IWebServer.build`

***

### start() {#start}

> **start**(): `Promise`\<`void`\>

Start the server.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the server is listening for connections.

#### Implementation of

`IWebServer.start`

***

### stop() {#stop}

> **stop**(): `Promise`\<`void`\>

Stop the server.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the server has shut down all connections.

#### Implementation of

`IWebServer.stop`

***

### health() {#health}

> **health**(`lastTimestamp`): `Promise`\<`IHealth`[]\>

Returns the health status of the component, the context IDs from init are set in the current context.

#### Parameters

##### lastTimestamp

`number`

The Unix timestamp (ms) recorded at the start of the previous cycle.

#### Returns

`Promise`\<`IHealth`[]\>

The health status of the component, can return multiple entries for elements within the component.

#### Implementation of

`IHealthProviderComponent.health`
