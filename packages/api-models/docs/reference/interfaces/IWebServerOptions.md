# Interface: IWebServerOptions

Options for the web server.

## Properties

### port? {#port}

> `optional` **port**: `number`

The port to bind the web server to.

***

### host? {#host}

> `optional` **host**: `string`

The address to bind the web server to.

***

### methods? {#methods}

> `optional` **methods**: `HttpMethod`[]

The methods that the server accepts.

***

### allowedHeaders? {#allowedheaders}

> `optional` **allowedHeaders**: `string`[]

Any additional allowed headers.

***

### exposedHeaders? {#exposedheaders}

> `optional` **exposedHeaders**: `string`[]

And additional exposed headers.

***

### corsOrigins? {#corsorigins}

> `optional` **corsOrigins**: `string` \| `string`[]

The allowed CORS domains.
