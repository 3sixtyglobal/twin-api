# Interface: ISocketRoute\<T, U\>

Interface which defines a socket route.

## Extends

- [`IBaseRoute`](IBaseRoute.md)

## Type Parameters

### T

`T` *extends* [`IHttpRequest`](IHttpRequest.md) = `any`

### U

`U` *extends* [`IHttpResponse`](IHttpResponse.md) = `any`

## Properties

### operationId {#operationid}

> **operationId**: `string`

The id of the operation.

#### Inherited from

[`IBaseRoute`](IBaseRoute.md).[`operationId`](IBaseRoute.md#operationid)

***

### path {#path}

> **path**: `string`

The path to use for routing.

#### Inherited from

[`IBaseRoute`](IBaseRoute.md).[`path`](IBaseRoute.md#path)

***

### skipAuth? {#skipauth}

> `optional` **skipAuth?**: `boolean`

Skips the authentication requirement for this route.

#### Inherited from

[`IBaseRoute`](IBaseRoute.md).[`skipAuth`](IBaseRoute.md#skipauth)

***

### skipTenant? {#skiptenant}

> `optional` **skipTenant?**: `boolean`

Skips the tenant requirement for this route.

#### Inherited from

[`IBaseRoute`](IBaseRoute.md).[`skipTenant`](IBaseRoute.md#skiptenant)

***

### requiredScope? {#requiredscope}

> `optional` **requiredScope?**: `string`[]

The user must have one of the specified scopes to access the route.

#### Inherited from

[`IBaseRoute`](IBaseRoute.md).[`requiredScope`](IBaseRoute.md#requiredscope)

***

### processorFeatures? {#processorfeatures}

> `optional` **processorFeatures?**: `string`[]

The features supported by additional processors to run for this route.

#### Inherited from

[`IBaseRoute`](IBaseRoute.md).[`processorFeatures`](IBaseRoute.md#processorfeatures)

***

### processorData? {#processordata}

> `optional` **processorData?**: `object`

The data for additional processors to run for this route.

#### Index Signature

\[`key`: `string`\]: `unknown`

#### Inherited from

[`IBaseRoute`](IBaseRoute.md).[`processorData`](IBaseRoute.md#processordata)

***

### handler {#handler}

> **handler**: (`socketRequestContext`, `request`, `emit`) => `void`

The handler module.

#### Parameters

##### socketRequestContext

[`ISocketRequestContext`](ISocketRequestContext.md)

The request context.

##### request

`T`

The request object.

##### emit

(`event`, `response`) => `Promise`\<`void`\>

The function to emit an event.

#### Returns

`void`

***

### connected? {#connected}

> `optional` **connected?**: (`socketRequestContext`) => `void`

The connected handler.

#### Parameters

##### socketRequestContext

[`ISocketRequestContext`](ISocketRequestContext.md)

The request context.

#### Returns

`void`

***

### disconnected? {#disconnected}

> `optional` **disconnected?**: (`socketRequestContext`) => `void`

The disconnected handler.

#### Parameters

##### socketRequestContext

[`ISocketRequestContext`](ISocketRequestContext.md)

The request context.

#### Returns

`void`
