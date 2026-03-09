# Models Examples

These snippets show practical helpers for URL manipulation, request parameter conversion, and consistent error responses.

## HttpUrlHelper

```typescript
import { HttpUrlHelper } from '@twin.org/api-models';

const fullUrl = 'https://tenant.example.org/orders?page=2';

console.log(HttpUrlHelper.extractOrigin(fullUrl)); // https://tenant.example.org
console.log(HttpUrlHelper.extractPath(fullUrl)); // /orders
console.log(HttpUrlHelper.extractSearch(fullUrl)); // ?page=2
console.log(HttpUrlHelper.extractPathAndSearch(fullUrl)); // /orders?page=2
```

```typescript
import { HttpUrlHelper } from '@twin.org/api-models';

const combined = HttpUrlHelper.combineParts('https://tenant.example.org/', '/api/v1/orders');
const replaced = HttpUrlHelper.replaceOrigin(combined ?? '', 'https://edge.example.org');

console.log(combined); // https://tenant.example.org/api/v1/orders
console.log(replaced); // https://edge.example.org/api/v1/orders
```

## HttpParameterHelper

```typescript
import { HttpParameterHelper } from '@twin.org/api-models';

const ids = HttpParameterHelper.arrayFromString('id-1,id-2,id-3');
const idsAsString = HttpParameterHelper.arrayToString(ids);

const filterObject = HttpParameterHelper.objectFromString('{"status":"active"}');
const filterString = HttpParameterHelper.objectToString(filterObject);

console.log(ids.length); // 3
console.log(idsAsString); // id-1,id-2,id-3
console.log(filterString); // {"status":"active"}
```

## HttpErrorHelper

```typescript
import { HttpErrorHelper } from '@twin.org/api-models';

try {
  throw new Error('Invalid request');
} catch (err) {
  const mapped = HttpErrorHelper.processError(err, false);
  const response: {
    body?: unknown;
    statusCode?: number;
    headers?: { [id: string]: string };
  } = {};
  HttpErrorHelper.buildResponse(response, mapped.error, mapped.httpStatusCode);

  console.log(response.statusCode); // 500
  console.log(mapped.error.message); // Error: Invalid request
}
```
