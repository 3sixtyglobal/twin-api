# Interface: IAdminUserUpdatePasswordRequest

Update a users password as an admin.

## Properties

### pathParams

> **pathParams**: `object`

The path parameters for the request.

#### email

> **email**: `string`

The user email.

***

### body

> **body**: `object`

The body of the request.

#### newPassword

> **newPassword**: `string`

The new password for the user.

#### currentPassword?

> `optional` **currentPassword**: `string`

The current password for the user.
