# User

Instance methods:

* [constructor](./User.md#constructor)
* [fetchProfile](./User.md#fetchprofile)
* [getProject](./User.md#getproject)
* [listProjects](./User.md#listprojects)
* [createProject](./User.md#createproject)
* [getWhoami](./User.md#getwhoami) *deprecated*

Static properties:

* [serializeProfile](User.md#serializeprofile)

## Instance Methods

### <a id="constructor"></a>constructor: `User(credentials)`

#### Arguments

1. `credentials` *([Credentials](../Glossary.md#credentials))*: Valid
credentials corresponding to the current user

#### Returns

*(User)* A User instance

### <a id="fetchprofile"></a>`fetchProfile()`

#### Returns

`(Promise --> Object)` Resolves to the [serialized](User.md#serializeprofile)
API response

### <a id="getProject"></a>`getProject(id)`

See [Project#constructor](./Project.md#constructor)

```js
new User(credentials).getProject(id)
```

is equivalent to

```js
new Project(credentials, id)
```

### <a id="listprojects"></a>`listProjects()`

See [Project#listProjects](./Project.md#listprojects)

```js
new User(credentials).listProjects()
```

is equivalent to

```js
Project.listProjects(credentials)
```

### <a id="createproject"></a>`createProject()`

See [`Project#createProject`](./Project.md#createproject)

```js
new User(credentials).createProject(name, options)
```

is equivalent to

```js
Project.createProject(credentials, name, options)
```

### <a id="getWhoami"></a>`getWhoami()` **deprecated**

TODO

## Static Properties

### <a id="serializeprofile"></a>`serializeProfile`

Set to override how the SDK serializes the API response for the profile.

By default, this will return an `Object` with the structure:

```js
type ProfileResponse = {
  id: String,
  email: String,
  makerId: String,
  displayName: String,
  firstName: String,
  lastName: String,
  kind: 'maker' | 'camper' | 'viewer',
}
```

See [Serialization](../advanced/Serialization.md) for more information.
