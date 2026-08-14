# Class: ScopeHelper

Helper methods for working with scope values stored as comma-separated strings.

## Constructors

### Constructor

> **new ScopeHelper**(): `ScopeHelper`

#### Returns

`ScopeHelper`

## Methods

### toArray() {#toarray}

> `static` **toArray**(`scope`): `string`[]

Converts a scope value to a normalised lowercase array. Accepts either a comma-separated
string or an already-split array, so callers do not need to branch on input type.
Returns an empty array for an empty or undefined input.

#### Parameters

##### scope

`string` \| `string`[] \| `undefined`

The comma-separated scope string, or an array of scope entries.

#### Returns

`string`[]

The scope entries as a trimmed, lowercase array.

***

### toString() {#tostring}

> `static` **toString**(`scopes`): `string`

Joins a scope array into a normalised comma-separated string, trimming and lowercasing each entry.

#### Parameters

##### scopes

`string`[]

The scope entries to join.

#### Returns

`string`

The comma-separated scope string.

***

### includes() {#includes}

> `static` **includes**(`scope`, `value`): `boolean`

Returns true if the scope includes the specified value. Accepts either a
comma-separated string or an array, matching the input forms accepted by toArray.

#### Parameters

##### scope

`string` \| `string`[] \| `undefined`

The comma-separated scope string or array to search.

##### value

`string`

The scope value to look for.

#### Returns

`boolean`

True when value is present in the scope.
