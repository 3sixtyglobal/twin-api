# Interface: IEntityStorageAuthenticationRestClientConstructorOptions

Options for the Entity Storage Authentication REST client constructor.

## Extends

- `IBaseRestClientConfig`

## Properties

### cookieName? {#cookiename}

> `optional` **cookieName**: `string`

The name of the cookie to use for storing the auth token.

#### Default

```ts
access_token
```

***

### endpoint {#endpoint}

> **endpoint**: `string`

The endpoint where the api is hosted.

#### Inherited from

`IBaseRestClientConfig.endpoint`

***

### pathPrefix? {#pathprefix}

> `optional` **pathPrefix**: `string`

The prefix to the routes.

#### Inherited from

`IBaseRestClientConfig.pathPrefix`

***

### headers? {#headers}

> `optional` **headers**: `IHttpHeaders`

The headers to include in requests.

#### Inherited from

`IBaseRestClientConfig.headers`

***

### timeout? {#timeout}

> `optional` **timeout**: `number`

Timeout for requests in ms.

#### Inherited from

`IBaseRestClientConfig.timeout`

***

### includeCredentials? {#includecredentials}

> `optional` **includeCredentials**: `boolean`

Include credentials in the request, defaults to true.

#### Inherited from

`IBaseRestClientConfig.includeCredentials`
