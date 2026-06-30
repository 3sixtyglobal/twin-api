# Class: HttpUrlHelper

Class to help with handling http URLs.

## Constructors

### Constructor

> **new HttpUrlHelper**(): `HttpUrlHelper`

#### Returns

`HttpUrlHelper`

## Methods

### extractOrigin() {#extractorigin}

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

### extractPath() {#extractpath}

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

### extractSearch() {#extractsearch}

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

### extractPathAndSearch() {#extractpathandsearch}

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

### combineOriginPath() {#combineoriginpath}

> `static` **combineOriginPath**(`origin?`, `path?`): `string` \| `undefined`

Combine an optional origin and an optional path into a single URL string.
Relative paths (no protocol, no leading slash) have a leading slash prepended.
Trailing slashes are trimmed from the origin before joining.
Returns undefined when both arguments are absent or empty.

#### Parameters

##### origin?

`string`

The optional origin (e.g. "https://example.com").

##### path?

`string`

The optional path or URL template (e.g. "/api/items" or "api/items").

#### Returns

`string` \| `undefined`

The combined string, or undefined when both are absent.

***

### encodeUriPathSegment() {#encodeuripathsegment}

> `static` **encodeUriPathSegment**(`segment`): `string`

Encode a single URL path segment per RFC 3986 §3.3.
Unlike encodeURIComponent, sub-delimiters ($ & + , ; =) and the colon and
at-sign characters that are valid unencoded in path segments are preserved.

#### Parameters

##### segment

`string`

The raw path segment value to encode.

#### Returns

`string`

The percent-encoded path segment.

#### See

https://datatracker.ietf.org/doc/html/rfc3986#section-3.3

***

### replaceOrigin() {#replaceorigin}

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

***

### addQueryStringParam() {#addquerystringparam}

> `static` **addQueryStringParam**(`url`, `key`, `value`): `string`

Add a query string parameter to the url.

#### Parameters

##### url

`string`

The url to add the query string parameter to.

##### key

`string`

The key of the query string parameter.

##### value

`string`

The value of the query string parameter.

#### Returns

`string`

The url with the added query string parameter.

***

### getQueryStringParam() {#getquerystringparam}

> `static` **getQueryStringParam**(`url`, `key`): `string` \| `undefined`

Get a query string parameter from the url.

#### Parameters

##### url

`string`

The url to get the query string parameter from.

##### key

`string`

The key of the query string parameter.

#### Returns

`string` \| `undefined`

The value of the query string parameter.
