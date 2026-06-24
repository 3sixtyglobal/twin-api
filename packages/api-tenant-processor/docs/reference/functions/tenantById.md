# Function: tenantById()

> **tenantById**(`httpRequestContext`, `componentName`, `request`): `Promise`\<[`ITenantGetResponse`](../interfaces/ITenantGetResponse.md)\>

Get the tenant by id.

## Parameters

### httpRequestContext

`IHttpRequestContext`

The request context for the API.

### componentName

`string`

The name of the component to use in the routes.

### request

[`ITenantGetByIdRequest`](../interfaces/ITenantGetByIdRequest.md)

The request.

## Returns

`Promise`\<[`ITenantGetResponse`](../interfaces/ITenantGetResponse.md)\>

The response object with additional http response properties.
