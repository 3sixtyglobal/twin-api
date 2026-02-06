# Interface: IAdminUserUpdateRequest

Update a user as an admin.

## Properties

### pathParams

> **pathParams**: `object`

The path parameters for the request.

#### email

> **email**: `string`

The user email.

***

### body

> **body**: `Partial`\<`Omit`\<[`IAuthenticationUser`](IAuthenticationUser.md), `"email"` \| `"password"` \| `"salt"`\>\>

The body of the request.
