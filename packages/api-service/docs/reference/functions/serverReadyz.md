# Function: serverReadyz()

> **serverReadyz**(`httpRequestContext`, `componentName`, `request`): `Promise`\<`IServerReadyzResponse`\>

Get the readyz for the server.

## Parameters

### httpRequestContext

`IHttpRequestContext`

The request context for the API.

### componentName

`string`

The name of the component to use in the routes.

### request

`INoContentRequest`

The request.

## Returns

`Promise`\<`IServerReadyzResponse`\>

The response object with additional http response properties.
