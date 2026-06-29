# Class: HttpHeaderHelper

Class to help with handling http headers.

## Constructors

### Constructor

> **new HttpHeaderHelper**(): `HttpHeaderHelper`

#### Returns

`HttpHeaderHelper`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### buildCursor() {#buildcursor}

> `static` **buildCursor**(`headers`, `url`, `publicOrigin`, `cursor`): asserts headers is IHttpHeaders & \{ link: string \| undefined \}

Set the Link header with a next cursor relation when a cursor is present.

#### Parameters

##### headers

`IHttpHeaders`

The response headers to mutate.

##### url

`string`

The request URL used as the base for the link.

##### publicOrigin

`string` \| `undefined`

The public origin to substitute into the URL, if any.

##### cursor

`string` \| `undefined`

The cursor value; when undefined or empty the header is not set.

#### Returns

asserts headers is IHttpHeaders & \{ link: string \| undefined \}

***

### buildId() {#buildid}

> `static` **buildId**(`headers`, `id`, `baseUrl?`): `asserts headers is IHttpHeaders & { location: string }`

Set the Location header to the encoded ID, optionally placed within a base URL or template.
When baseUrl contains a colon-prefixed placeholder (e.g. "/path1/:id/path2") the
encoded ID is substituted at that position; otherwise it is appended.
The base URL may be an absolute URL or a relative path. When omitted the bare
encoded ID is used.

#### Parameters

##### headers

`IHttpHeaders`

The response headers to mutate.

##### id

`string`

The resource ID to encode and place.

##### baseUrl?

`string`

The optional base URL, relative path, or URL template.

#### Returns

`asserts headers is IHttpHeaders & { location: string }`

***

### buildJsonContentType() {#buildjsoncontenttype}

> `static` **buildJsonContentType**(`headers`, `requestHeaders?`): asserts headers is IHttpHeaders & \{ content-type: "application/json" \| "application/ld+json" \}

Set the Content-Type header to JSON-LD or JSON depending on the request Accept header.
Uses HeaderHelper.extractAccept which parses the Accept header per RFC 7231 and returns
entries ordered by quality descending, preserving original order for equal q-values.

#### Parameters

##### headers

`IHttpHeaders`

The response headers to mutate.

##### requestHeaders?

`IHttpHeaders`

The request headers to inspect for the Accept value.

#### Returns

asserts headers is IHttpHeaders & \{ content-type: "application/json" \| "application/ld+json" \}

***

### extractCursor() {#extractcursor}

> `static` **extractCursor**(`headers?`): `string` \| `undefined`

Extract the cursor from the Link header's next relation.

#### Parameters

##### headers?

`IHttpHeaders`

The response headers to extract the cursor from.

#### Returns

`string` \| `undefined`

The cursor value or undefined if not present.

***

### extractId() {#extractid}

> `static` **extractId**(`headers?`, `template?`): `string`

Extract the resource ID from the Location response header.
Handles absolute URLs (http://host/path/:id, http://host/path/:id?foo=bar),
relative paths (/segment/:id, ./segment/:id), and bare ID values.
When a URL template such as "/path1/:id/path2" is supplied the ID is extracted
from the segment position marked by the first colon-prefixed placeholder.
Without a template the last path segment is returned.

#### Parameters

##### headers?

`IHttpHeaders`

The response headers containing the Location header.

##### template?

`string`

Optional URL template with a colon-prefixed placeholder marking the ID position, e.g. "/path1/:id/path2".

#### Returns

`string`

The extracted ID string.

#### Throws

GeneralError If the Location header is missing, the template has no placeholder, or the ID cannot be extracted.
