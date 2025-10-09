# Interface: IAuthenticationGenerator

Definition for the authentication generator component.

## Extends

- `IComponent`

## Indexable

\[`key`: `string`\]: `any`

All methods are optional, so we introduce an index signature to allow
any additional properties or methods, which removes the TypeScript error where
the class has no properties in common with the type.

## Methods

### addAuthentication()

> **addAuthentication**(`requestHeaders`, `authData?`): `Promise`\<`void`\>

Adds authentication information to the request headers.

#### Parameters

##### requestHeaders

`IHttpHeaders`

The request headers to add authentication information to.

##### authData?

`unknown`

Optional authentication data passed from the request.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the authentication information has been added.
