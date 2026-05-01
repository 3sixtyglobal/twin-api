# Class: TenantProcessor

Handles incoming api keys and maps them to tenant ids.

## Implements

- `IBaseRouteProcessor`

## Constructors

### Constructor

> **new TenantProcessor**(`options?`): `TenantProcessor`

Create a new instance of NodeTenantProcessor.

#### Parameters

##### options?

[`ITenantProcessorConstructorOptions`](../interfaces/ITenantProcessorConstructorOptions.md)

Options for the processor.

#### Returns

`TenantProcessor`

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

`IBaseRouteProcessor.className`

***

### start() {#start}

> **start**(`nodeLoggingComponentType?`): `Promise`\<`void`\>

The processor needs to be started when the application is initialized so that
the node identity is available for vault key resolution. Only required when
the encrypted-token path is wired (i.e. `signingKeyName` is configured).

#### Parameters

##### nodeLoggingComponentType?

`string`

The node logging component type.

#### Returns

`Promise`\<`void`\>

Nothing.

#### Implementation of

`IBaseRouteProcessor.start`

***

### pre() {#pre}

> **pre**(`request`, `response`, `route`, `contextIds`, `processorState`): `Promise`\<`void`\>

Pre process the REST request for the specified route.

#### Parameters

##### request

`IHttpServerRequest`

The incoming request.

##### response

`IHttpResponse`

The outgoing response.

##### route

`IBaseRoute` \| `undefined`

The route to process.

##### contextIds

`IContextIds`

The context IDs of the request.

##### processorState

The state handed through the processors.

#### Returns

`Promise`\<`void`\>

#### Implementation of

`IBaseRouteProcessor.pre`
