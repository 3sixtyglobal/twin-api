# Auth Entity Storage Service Examples

These snippets show how to wire authentication services into your component container and apply token processing in request pipelines.

## EntityStorageAuthenticationAdminService

```typescript
import { EntityStorageAuthenticationAdminService } from '@twin.org/api-auth-entity-storage-service';

const adminService = new EntityStorageAuthenticationAdminService();

console.log(adminService.className()); // EntityStorageAuthenticationAdminService

await adminService.create({
  email: 'owner@example.org',
  password: 'StartPassword123',
  userIdentity: 'did:example:owner',
  organizationIdentity: 'did:example:org',
  scope: ['admin']
});

await adminService.update({
  email: 'owner@example.org',
  scope: ['admin', 'security']
});

await adminService.updatePassword('owner@example.org', 'StartPassword124', 'StartPassword123');

const fromIdentity = await adminService.getByIdentity('did:example:owner');
console.log(fromIdentity.scope.length); // 2
```

```typescript
import { EntityStorageAuthenticationAdminService } from '@twin.org/api-auth-entity-storage-service';

const adminService = new EntityStorageAuthenticationAdminService();
const user = await adminService.get('owner@example.org');
await adminService.remove(user.email);

console.log(user.email); // owner@example.org
```

## EntityStorageAuthenticationService

```typescript
import { EntityStorageAuthenticationService } from '@twin.org/api-auth-entity-storage-service';

const authService = new EntityStorageAuthenticationService();

await authService.start('default');
console.log(authService.className()); // EntityStorageAuthenticationService

const loginResult = await authService.login('alice@example.org', 'correct-horse-battery-staple');

const refreshResult = await authService.refresh(loginResult.token);

await authService.updatePassword('correct-horse-battery-staple', 'correct-horse-battery-staple-2');

await authService.logout(refreshResult.token);
console.log(refreshResult.expiry > 0); // true
```

## AuthHeaderProcessor

```typescript
import { AuthHeaderProcessor } from '@twin.org/api-auth-entity-storage-service';

const processor = new AuthHeaderProcessor();

await processor.start('default');
console.log(processor.className()); // AuthHeaderProcessor

const request = {
  method: 'get',
  url: '/info',
  headers: {
    authorization: 'Bearer token-value'
  }
};

const response = {};
const contextIds = {};
const processorState: { [id: string]: unknown } = {};

await processor.pre(request, response, { skipAuth: false }, contextIds, processorState);

await processor.post(request, response, { skipAuth: false }, contextIds, processorState);
```
