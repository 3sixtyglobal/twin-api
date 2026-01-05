# Function: serverLivez()

> **serverLivez**(`httpRequestContext`, `componentName`, `request`): `Promise`\<`IServerLivezResponse`\>

Get the livez for the server.

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

`Promise`\<`IServerLivezResponse`\>

The response object with additional http response properties.
