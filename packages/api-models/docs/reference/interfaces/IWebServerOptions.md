# Interface: IWebServerOptions

Options for the web server.

## Properties

### port?

> `optional` **port**: `number`

The port to bind the web server to.

***

### host?

> `optional` **host**: `string`

The address to bind the web server to.

***

### methods?

> `optional` **methods**: `HttpMethod`[]

The methods that the server accepts.

***

### allowedHeaders?

> `optional` **allowedHeaders**: `string`[]

Any additional allowed headers.

***

### exposedHeaders?

> `optional` **exposedHeaders**: `string`[]

And additional exposed headers.

***

### corsOrigins?

> `optional` **corsOrigins**: `string` \| `string`[]

The allowed CORS domains.
