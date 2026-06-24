# Function: tenantByApiKey()

> **tenantByApiKey**(`httpRequestContext`, `componentName`, `request`): `Promise`\<[`ITenantGetResponse`](../interfaces/ITenantGetResponse.md)\>

Get the tenant by api key.

## Parameters

### httpRequestContext

`IHttpRequestContext`

The request context for the API.

### componentName

`string`

The name of the component to use in the routes.

### request

[`ITenantGetByApiKeyRequest`](../interfaces/ITenantGetByApiKeyRequest.md)

The request.

## Returns

`Promise`\<[`ITenantGetResponse`](../interfaces/ITenantGetResponse.md)\>

The response object with additional http response properties.
