# Interface: IBaseSocketClientConfig

Definition for the configuration of a socket service.

## Properties

### basePath? {#basepath}

> `optional` **basePath**: `string`

Base path for the socket service, defaults to /socket.

***

### endpoint {#endpoint}

> **endpoint**: `string`

The endpoint where the api is hosted.

***

### pathPrefix? {#pathprefix}

> `optional` **pathPrefix**: `string`

The prefix to the routes.

***

### headers? {#headers}

> `optional` **headers**: `IHttpHeaders`

The headers to include in requests.
