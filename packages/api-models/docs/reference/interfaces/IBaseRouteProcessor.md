# Interface: IBaseRouteProcessor\<T, R\>

The definition for a base processor for handling REST routes.

## Extends

- `IComponent`

## Extended by

- [`IRestRouteProcessor`](IRestRouteProcessor.md)
- [`ISocketRouteProcessor`](ISocketRouteProcessor.md)

## Type Parameters

### T

`T` = [`IBaseRoute`](IBaseRoute.md)

### R

`R` = [`IHttpServerRequest`](IHttpServerRequest.md)

## Methods

### features()? {#features}

> `optional` **features**(): `string`[]

Features supported by this processor.
If a route has any of these features listed, this processor will be run for that route.
If this is not implemented, the processor will run for all routes.

#### Returns

`string`[]

The features supported by this processor.

***

### pre()? {#pre}

> `optional` **pre**(`request`, `response`, `route`, `contextIds`, `processorState`, `componentTypes?`): `Promise`\<`void`\>

Pre process the REST request for the specified route.

#### Parameters

##### request

`R`

The request to handle.

##### response

[`IHttpResponse`](IHttpResponse.md)

The response data to send if any.

##### route

`T` \| `undefined`

The route being requested, if a matching one was found.

##### contextIds

`IContextIds`

The context IDs of the request.

##### processorState

The state handed through the processors.

##### componentTypes?

The component types for the request.

###### loggingComponentType?

`string`

The logging component type.

###### hostingComponentType?

`string`

The hosting component type.

#### Returns

`Promise`\<`void`\>

Promise that resolves when the request is processed.

***

### post()? {#post}

> `optional` **post**(`request`, `response`, `route`, `contextIds`, `processorState`, `componentTypes?`): `Promise`\<`void`\>

Post process the REST request for the specified route.

#### Parameters

##### request

`R`

The request to handle.

##### response

[`IHttpResponse`](IHttpResponse.md)

The response data to send if any.

##### route

`T` \| `undefined`

The route being requested, if a matching one was found.

##### contextIds

`IContextIds`

The context IDs of the request.

##### processorState

The state handed through the processors.

##### componentTypes?

The component types for the request.

###### loggingComponentType?

`string`

The logging component type.

###### hostingComponentType?

`string`

The hosting component type.

#### Returns

`Promise`\<`void`\>

Promise that resolves when the request is processed.
