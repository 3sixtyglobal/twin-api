# Interface: IBaseRestClientConfig

Definition for the configuration of a rest client.

## Properties

### endpoint {#endpoint}

> **endpoint**: `string`

The endpoint where the api is hosted.

***

### pathPrefix? {#pathprefix}

> `optional` **pathPrefix?**: `string`

The prefix to the routes.

***

### headers? {#headers}

> `optional` **headers?**: `IHttpHeaders`

The headers to include in requests.

***

### timeout? {#timeout}

> `optional` **timeout?**: `number`

Timeout for requests in ms.

***

### includeCredentials? {#includecredentials}

> `optional` **includeCredentials?**: `boolean`

Include credentials in the request, defaults to true.
