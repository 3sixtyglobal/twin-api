# Class: HttpUrlHelper

Class to help with handling http URLs.

## Constructors

### Constructor

> **new HttpUrlHelper**(): `HttpUrlHelper`

#### Returns

`HttpUrlHelper`

## Methods

### extractOrigin()

> `static` **extractOrigin**(`url`): `string` \| `undefined`

Extract the origin from the url which includes protocol,host,port.

#### Parameters

##### url

`string`

The url to extract the origin from.

#### Returns

`string` \| `undefined`

The extracted origin.

#### See

https://developer.mozilla.org/en-US/docs/Web/API/URL/origin

***

### extractPath()

> `static` **extractPath**(`url`): `string` \| `undefined`

Extract the path from the url.

#### Parameters

##### url

`string`

The url to extract the path from.

#### Returns

`string` \| `undefined`

The extracted path.

#### See

https://developer.mozilla.org/en-US/docs/Web/API/URL/pathname

***

### extractSearch()

> `static` **extractSearch**(`url`): `string` \| `undefined`

Extract the search from the url.

#### Parameters

##### url

`string`

The url to extract the search from.

#### Returns

`string` \| `undefined`

The extracted search.

#### See

https://developer.mozilla.org/en-US/docs/Web/API/URL/search

***

### extractPathAndSearch()

> `static` **extractPathAndSearch**(`url`): `string` \| `undefined`

Extract the path and search from the url.

#### Parameters

##### url

`string`

The url to extract the path and search from.

#### Returns

`string` \| `undefined`

The extracted path and search.

***

### combineParts()

> `static` **combineParts**(`origin`, `pathAndSearch`): `string` \| `undefined`

Combine the urls parts.

#### Parameters

##### origin

`string`

The origin to combine.

##### pathAndSearch

`string`

The path and search to combine.

#### Returns

`string` \| `undefined`

The combined parts.

***

### replaceOrigin()

> `static` **replaceOrigin**(`url`, `newOrigin?`): `string`

Replace the origin in the url.

#### Parameters

##### url

`string`

The url to replace the origin in.

##### newOrigin?

`string`

The new origin to use.

#### Returns

`string`

The url with the replaced origin.
