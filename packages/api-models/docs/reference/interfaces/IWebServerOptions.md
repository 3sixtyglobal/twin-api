# Interface: IWebServerOptions

Options for the web server.

## Properties

### port? {#port}

> `optional` **port?**: `number`

The port to bind the web server to.

#### Default

```ts
3000
```

***

### host? {#host}

> `optional` **host?**: `string`

The address to bind the web server to.

#### Default

```ts
localhost
```

***

### methods? {#methods}

> `optional` **methods?**: `HttpMethod`[]

The methods that the server accepts.

#### Default

```ts
["GET", "PUT", "POST", "DELETE", "OPTIONS"]
```

***

### allowedHeaders? {#allowedheaders}

> `optional` **allowedHeaders?**: `string`[]

Any additional allowed headers.

***

### exposedHeaders? {#exposedheaders}

> `optional` **exposedHeaders?**: `string`[]

And additional exposed headers.

***

### corsOrigins? {#corsorigins}

> `optional` **corsOrigins?**: `string` \| `string`[]

The allowed CORS domains.

#### Default

```ts
["*"]
```

***

### publicOrigin? {#publicorigin}

> `optional` **publicOrigin?**: `string`

The public origin of the server, used for constructing the request URL.
If not provided, it will be determined from the incoming request.

***

### bodyLimits? {#bodylimits}

> `optional` **bodyLimits?**: `object`

Named body size limits in bytes for REST routes, referenced by a route's bodyLimit name.
Merged over the server's built-in limits; the "default" entry applies to routes with no bodyLimit name.

#### Index Signature

\[`name`: `string`\]: `number`
