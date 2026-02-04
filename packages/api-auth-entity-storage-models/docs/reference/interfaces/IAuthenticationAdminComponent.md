# Interface: IAuthenticationAdminComponent

Contract definition for authentication admin component.

## Extends

- `IComponent`

## Methods

### create()

> **create**(`user`): `Promise`\<`void`\>

Create a login for the user.

#### Parameters

##### user

`Omit`\<[`IAuthenticationUser`](IAuthenticationUser.md), `"salt"`\>

The user to create.

#### Returns

`Promise`\<`void`\>

Nothing.

***

### update()

> **update**(`user`): `Promise`\<`void`\>

Update a login for the user.

#### Parameters

##### user

`Partial`\<`Omit`\<[`IAuthenticationUser`](IAuthenticationUser.md), `"password"` \| `"salt"`\>\>

The user to update.

#### Returns

`Promise`\<`void`\>

Nothing.

***

### get()

> **get**(`email`): `Promise`\<`Omit`\<[`IAuthenticationUser`](IAuthenticationUser.md), `"salt"` \| `"password"`\>\>

Get a user by email.

#### Parameters

##### email

`string`

The email address of the user to get.

#### Returns

`Promise`\<`Omit`\<[`IAuthenticationUser`](IAuthenticationUser.md), `"salt"` \| `"password"`\>\>

The user details.

***

### getByIdentity()

> **getByIdentity**(`identity`): `Promise`\<`Omit`\<[`IAuthenticationUser`](IAuthenticationUser.md), `"salt"` \| `"password"`\>\>

Get a user by identity.

#### Parameters

##### identity

`string`

The identity of the user to get.

#### Returns

`Promise`\<`Omit`\<[`IAuthenticationUser`](IAuthenticationUser.md), `"salt"` \| `"password"`\>\>

The user details.

***

### remove()

> **remove**(`email`): `Promise`\<`void`\>

Remove a current user.

#### Parameters

##### email

`string`

The email address of the user to remove.

#### Returns

`Promise`\<`void`\>

Nothing.

***

### updatePassword()

> **updatePassword**(`email`, `newPassword`, `currentPassword?`): `Promise`\<`void`\>

Update the user's password.

#### Parameters

##### email

`string`

The email address of the user to update.

##### newPassword

`string`

The new password for the user.

##### currentPassword?

`string`

The current password, optional, if supplied will check against existing.

#### Returns

`Promise`\<`void`\>

Nothing.
