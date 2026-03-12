# Interface: IConflictResponse

The request resulted in a conflicting operation, see the content for more details.

## Properties

### statusCode {#statuscode}

> **statusCode**: `409`

Response status code.

***

### body {#body}

> **body**: `IError` & `object`

The body which contains the error.

#### Type Declaration

##### conflicts

> **conflicts**: `string`[]

The conflicting items.
