# Class: TokenHelper

Helper class for token operations.

## Constructors

### Constructor

> **new TokenHelper**(): `TokenHelper`

#### Returns

`TokenHelper`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### createToken() {#createtoken}

> `static` **createToken**(`vaultConnector`, `signingKeyName`, `userIdentity`, `organizationIdentity`, `tenantId`, `ttlMinutes`, `scope?`, `passwordVersion?`): `Promise`\<\{ `token`: `string`; `expiry`: `number`; \}\>

Create a new token.

#### Parameters

##### vaultConnector

`IVaultConnector`

The vault connector.

##### signingKeyName

`string`

The signing key name.

##### userIdentity

`string`

The subject for the token.

##### organizationIdentity

`string` \| `undefined`

The organization for the token.

##### tenantId

`string` \| `undefined`

The tenant id for the token.

##### ttlMinutes

`number`

The time to live for the token in minutes.

##### scope?

`string`

The scopes for the token.

##### passwordVersion?

`number`

The user's current password version counter, embedded in the token so that a password change invalidates existing tokens.

#### Returns

`Promise`\<\{ `token`: `string`; `expiry`: `number`; \}\>

The new token and its expiry date.

***

### verify() {#verify}

> `static` **verify**(`vaultConnector`, `signingKeyName`, `token`, `requiredScopes?`, `verifyUser?`): `Promise`\<\{ `header`: `JWTHeaderParameters`; `payload`: `JWTPayload`; \}\>

Verify the token.

#### Parameters

##### vaultConnector

`IVaultConnector`

The vault connector.

##### signingKeyName

`string`

The signing key name.

##### token

`string` \| `undefined`

The token to verify.

##### requiredScopes?

`string`[]

The required scopes.

##### verifyUser?

(`userIdentity`, `organizationIdentity`, `hashedTenantId`, `passwordVersion`) => `Promise`\<`string`[]\>

A function to verify the user identity and organization. The password version counter embedded in the token (pver claim) is passed so callers can detect if the password has changed since the token was issued.

#### Returns

`Promise`\<\{ `header`: `JWTHeaderParameters`; `payload`: `JWTPayload`; \}\>

The verified details.

#### Throws

UnauthorizedError if the token is missing, invalid or expired.

***

### extractTokenFromHeaders() {#extracttokenfromheaders}

> `static` **extractTokenFromHeaders**(`headers?`, `cookieName?`): \{ `token`: `string`; `location`: `"authorization"` \| `"cookie"`; \} \| `undefined`

Extract the auth token from the headers, either from the authorization header or the cookie header.

#### Parameters

##### headers?

`IHttpHeaders`

The headers to extract the token from.

##### cookieName?

`string`

The name of the cookie to extract the token from.

#### Returns

\{ `token`: `string`; `location`: `"authorization"` \| `"cookie"`; \} \| `undefined`

The token if found.

***

### hashTenantId() {#hashtenantid}

> `static` **hashTenantId**(`tenantId`): `string` \| `undefined`

Hash the tenant ID using Blake2b and encode it in Base64URL format.
Used to create a consistent and secure representation of tenant IDs without exposing the original values.

#### Parameters

##### tenantId

`string` \| `undefined`

The tenant ID to hash.

#### Returns

`string` \| `undefined`

The hashed tenant ID in Base64URL format, or undefined if the input tenant ID is not a valid string.
