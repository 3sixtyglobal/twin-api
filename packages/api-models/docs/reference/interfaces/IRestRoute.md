# Interface: IRestRoute\<T, U\>

Interface which defines a REST route.

## Extends

- [`IBaseRoute`](IBaseRoute.md)

## Type Parameters

### T

`T` *extends* [`IHttpRequest`](IHttpRequest.md) = `any`

### U

`U` *extends* [`IHttpResponse`](IHttpResponse.md) & [`IRestRouteResponseOptions`](IRestRouteResponseOptions.md) = `any`

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

### disableTenantOverride? {#disabletenantoverride}

> `optional` **disableTenantOverride?**: `boolean`

Set to true to prevent callers from using the overrideTenant query parameter on this route.
Tenant override is allowed by default, but you must hold the escalated privilege scope to use it.

#### Inherited from

[`IBaseRoute`](IBaseRoute.md).[`disableTenantOverride`](IBaseRoute.md#disabletenantoverride)

***

### summary {#summary}

> **summary**: `string`

Summary of what task the operation performs.

***

### tag {#tag}

> **tag**: `string`

Tag for the operation.

***

### method {#method}

> **method**: `HttpMethod`

The http method.

***

### handler {#handler}

> **handler**: (`httpRequestContext`, `request`) => `Promise`\<`U`\>

The handler module.

#### Parameters

##### httpRequestContext

[`IHttpRequestContext`](IHttpRequestContext.md)

The http request context.

##### request

`T`

The request object, combined query param, path params and body.

#### Returns

`Promise`\<`U`\>

***

### requestType? {#requesttype}

> `optional` **requestType?**: `object`

The type of the request object.

#### type

> **type**: `string`

The object type for the request.

#### mimeType?

> `optional` **mimeType?**: `string`

The mime type of the request, defaults to "application/json" if there is a body.

#### examples?

> `optional` **examples?**: [`IRestRouteRequestExample`](IRestRouteRequestExample.md)\<`T`\>[]

Example objects for the request.

***

### responseType? {#responsetype}

> `optional` **responseType?**: `object`[]

The type of the response object.

#### type

> **type**: `string`

The object type of the response.

#### mimeType?

> `optional` **mimeType?**: `string`

The mime type of the response, defaults to "application/json" if there is a body.

#### examples?

> `optional` **examples?**: [`IRestRouteResponseExample`](IRestRouteResponseExample.md)\<`U`\>[]

Example objects of the response.

***

### excludeFromSpec? {#excludefromspec}

> `optional` **excludeFromSpec?**: `boolean`

Exclude the route from being included in the spec file.
