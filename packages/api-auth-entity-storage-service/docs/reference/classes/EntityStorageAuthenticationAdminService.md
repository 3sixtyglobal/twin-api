# Class: EntityStorageAuthenticationAdminService

Implementation of the authentication component using entity storage.

## Implements

- `IAuthenticationAdminComponent`

## Constructors

### Constructor

> **new EntityStorageAuthenticationAdminService**(`options?`): `EntityStorageAuthenticationAdminService`

Create a new instance of EntityStorageAuthentication.

#### Parameters

##### options?

[`IEntityStorageAuthenticationAdminServiceConstructorOptions`](../interfaces/IEntityStorageAuthenticationAdminServiceConstructorOptions.md)

The dependencies for the identity connector.

#### Returns

`EntityStorageAuthenticationAdminService`

## Properties

### CLASS\_NAME

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### className()

> **className**(): `string`

Returns the class name of the component.

#### Returns

`string`

The class name of the component.

#### Implementation of

`IAuthenticationAdminComponent.className`

***

### create()

> **create**(`user`): `Promise`\<`void`\>

Create a login for the user.

#### Parameters

##### user

`Omit`\<`IAuthenticationUser`, `"salt"`\>

The user to create.

#### Returns

`Promise`\<`void`\>

Nothing.

#### Implementation of

`IAuthenticationAdminComponent.create`

***

### update()

> **update**(`user`): `Promise`\<`void`\>

Update a login for the user.

#### Parameters

##### user

`Partial`\<`Omit`\<`IAuthenticationUser`, `"password"` \| `"salt"`\>\>

The user to update.

#### Returns

`Promise`\<`void`\>

Nothing.

#### Implementation of

`IAuthenticationAdminComponent.update`

***

### get()

> **get**(`email`): `Promise`\<`Omit`\<`IAuthenticationUser`, `"salt"` \| `"password"`\>\>

Get a user by email.

#### Parameters

##### email

`string`

The email address of the user to get.

#### Returns

`Promise`\<`Omit`\<`IAuthenticationUser`, `"salt"` \| `"password"`\>\>

The user details.

#### Implementation of

`IAuthenticationAdminComponent.get`

***

### getByIdentity()

> **getByIdentity**(`identity`): `Promise`\<`Omit`\<`IAuthenticationUser`, `"salt"` \| `"password"`\>\>

Get a user by identity.

#### Parameters

##### identity

`string`

The identity of the user to get.

#### Returns

`Promise`\<`Omit`\<`IAuthenticationUser`, `"salt"` \| `"password"`\>\>

The user details.

#### Implementation of

`IAuthenticationAdminComponent.getByIdentity`

***

### remove()

> **remove**(`email`): `Promise`\<`void`\>

Remove the current user.

#### Parameters

##### email

`string`

The email address of the user to remove.

#### Returns

`Promise`\<`void`\>

Nothing.

#### Implementation of

`IAuthenticationAdminComponent.remove`

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

#### Implementation of

`IAuthenticationAdminComponent.updatePassword`
