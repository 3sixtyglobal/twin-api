# Function: tenantList()

> **tenantList**(`httpRequestContext`, `componentName`, `request`): `Promise`\<[`ITenantListResponse`](../interfaces/ITenantListResponse.md)\>

Get the list of tenants.

## Parameters

### httpRequestContext

`IHttpRequestContext`

The request context for the API.

### componentName

`string`

The name of the component to use in the routes.

### request

[`ITenantListRequest`](../interfaces/ITenantListRequest.md)

The request.

## Returns

`Promise`\<[`ITenantListResponse`](../interfaces/ITenantListResponse.md)\>

The response object with additional http response properties.
