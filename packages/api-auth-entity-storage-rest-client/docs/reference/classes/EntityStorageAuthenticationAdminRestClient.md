# Class: EntityStorageAuthenticationAdminRestClient

The client to connect to the authentication admin service.

## Extends

- `BaseRestClient`

## Implements

- `IAuthenticationAdminComponent`

## Constructors

### Constructor

> **new EntityStorageAuthenticationAdminRestClient**(`config`): `EntityStorageAuthenticationAdminRestClient`

Create a new instance of EntityStorageAuthenticationAdminRestClient.

#### Parameters

##### config

`IBaseRestClientConfig`

The configuration for the client.

#### Returns

`EntityStorageAuthenticationAdminRestClient`

#### Overrides

`BaseRestClient.constructor`

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

Remove a user.

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

***

### getEndpointWithPrefix()

> **getEndpointWithPrefix**(): `string`

Get the endpoint with the prefix for the namespace.

#### Returns

`string`

The endpoint with namespace prefix attached.

#### Inherited from

`BaseRestClient.getEndpointWithPrefix`

***

### fetch()

> **fetch**\<`T`, `U`\>(`route`, `method`, `request?`): `Promise`\<`U`\>

Perform a request in json format.

#### Type Parameters

##### T

`T` *extends* `IHttpRequest`\<`any`\>

##### U

`U` *extends* `IHttpResponse`\<`any`\>

#### Parameters

##### route

`string`

The route of the request.

##### method

`HttpMethod`

The http method.

##### request?

`T`

Request to send to the endpoint.

#### Returns

`Promise`\<`U`\>

The response.

#### Inherited from

`BaseRestClient.fetch`
