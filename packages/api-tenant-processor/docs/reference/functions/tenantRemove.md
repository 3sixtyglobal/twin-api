# Function: tenantRemove()

> **tenantRemove**(`httpRequestContext`, `componentName`, `request`): `Promise`\<`INoContentResponse`\>

Remove the tenant by id.

## Parameters

### httpRequestContext

`IHttpRequestContext`

The request context for the API.

### componentName

`string`

The name of the component to use in the routes.

### request

[`ITenantRemoveRequest`](../interfaces/ITenantRemoveRequest.md)

The request.

## Returns

`Promise`\<`INoContentResponse`\>

The response object with additional http response properties.
