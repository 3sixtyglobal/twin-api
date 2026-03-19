# Interface: IWebServerOptions

Options for the web server.

## Properties

### port? {#port}

> `optional` **port**: `number`

The port to bind the web server to.

#### Default

```ts
3000
```

***

### host? {#host}

> `optional` **host**: `string`

The address to bind the web server to.

#### Default

```ts
localhost
```

***

### methods? {#methods}

> `optional` **methods**: `HttpMethod`[]

The methods that the server accepts.

#### Default

```ts
["GET", "PUT", "POST", "DELETE", "OPTIONS"]
```

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

#### Default

```ts
["*"]
```
