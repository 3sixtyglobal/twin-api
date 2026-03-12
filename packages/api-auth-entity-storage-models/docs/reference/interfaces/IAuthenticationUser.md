# Interface: IAuthenticationUser

Contract definition for authentication user.

## Properties

### email {#email}

> **email**: `string`

The user e-mail address.

***

### password {#password}

> **password**: `string`

The encrypted password for the user.

***

### salt {#salt}

> **salt**: `string`

The salt for the password.

***

### userIdentity {#useridentity}

> **userIdentity**: `string`

The user identity.

***

### organizationIdentity {#organizationidentity}

> **organizationIdentity**: `string`

The users organization.

***

### scope {#scope}

> **scope**: `string`[]

The scope assigned to the user, comma separated.
