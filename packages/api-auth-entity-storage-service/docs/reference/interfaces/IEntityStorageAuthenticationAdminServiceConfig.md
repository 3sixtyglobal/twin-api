# Interface: IEntityStorageAuthenticationAdminServiceConfig

Configuration for the entity storage authentication admin service.

## Properties

### minPasswordLength? {#minpasswordlength}

> `optional` **minPasswordLength?**: `number`

The minimum password length.

#### Default

```ts
8
```

***

### escalatedPrivilegeScope? {#escalatedprivilegescope}

> `optional` **escalatedPrivilegeScope?**: `string`

The scope value that grants escalated privilege to assign privileged roles. Defaults to "global-admin".
