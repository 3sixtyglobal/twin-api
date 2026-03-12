# Class: HttpErrorHelper

Class to help with processing http errors.

## Constructors

### Constructor

> **new HttpErrorHelper**(): `HttpErrorHelper`

#### Returns

`HttpErrorHelper`

## Properties

### ERROR\_TYPE\_MAP {#error_type_map}

> `readonly` `static` **ERROR\_TYPE\_MAP**: `object`

Mapping of error types to status codes.

#### Index Signature

\[`id`: `string`\]: `HttpStatusCode`

## Methods

### processError() {#processerror}

> `static` **processError**(`err`, `includeStack?`): `object`

Process the errors from the routes.

#### Parameters

##### err

`unknown`

The error to process.

##### includeStack?

`boolean`

Should the stack be included in the error.

#### Returns

`object`

The status code and additional error data.

##### error

> **error**: `IError`

##### httpStatusCode

> **httpStatusCode**: `HttpStatusCode`

***

### buildResponse() {#buildresponse}

> `static` **buildResponse**(`response`, `error`, `statusCode`): `void`

Build an error response.

#### Parameters

##### response

[`IHttpResponse`](../interfaces/IHttpResponse.md)

The response to build the error into.

##### error

`IError`

The error to build the response for.

##### statusCode

`HttpStatusCode`

The status code to use for the error.

#### Returns

`void`
