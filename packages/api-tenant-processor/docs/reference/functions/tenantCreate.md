# Function: tenantCreate()

> **tenantCreate**(`httpRequestContext`, `componentName`, `request`, `baseRouteName`): `Promise`\<`ICreatedResponse`\>

Create the tenant.

## Parameters

### httpRequestContext

`IHttpRequestContext`

The request context for the API.

### componentName

`string`

The name of the component to use in the routes.

### request

[`ITenantCreateRequest`](../interfaces/ITenantCreateRequest.md)

The request.

### baseRouteName

`string`

The base route name for the tenant.

## Returns

`Promise`\<`ICreatedResponse`\>

The response object with additional http response properties.
