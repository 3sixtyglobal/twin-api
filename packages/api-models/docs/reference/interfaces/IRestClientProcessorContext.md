# Interface: IRestClientProcessorContext

The context of a rest client processor.

## Properties

### restClientClassName {#restclientclassname}

> **restClientClassName**: `string`

The name of the REST client making the request.

***

### baseUrl {#baseurl}

> **baseUrl**: `string`

The base URL of the request.

***

### routeTemplate {#routetemplate}

> **routeTemplate**: `string`

The route template before path parameter substitution.

***

### route {#route}

> **route**: `string`

The route being requested.

***

### method {#method}

> **method**: `HttpMethod`

The HTTP method of the request.

***

### headers {#headers}

> **headers**: `IHttpHeaders`

The headers being sent with the request.

***

### timeout? {#timeout}

> `optional` **timeout?**: `number`

The timeout for the request in milliseconds.

***

### includeCredentials? {#includecredentials}

> `optional` **includeCredentials?**: `boolean`

Whether to include credentials in the request.

***

### body? {#body}

> `optional` **body?**: `string`

The request being made.
