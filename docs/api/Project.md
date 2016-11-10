# Project

Instance methods:

* [constructor](Project.md#constructor)
* [getDataTable](Project.md#getdatatable)
* [delete](Project.md#delete)
* [listUsers](Project.md#listusers)
* [share](Project.md#share)
* [unshare](Project.md#share)

Static methods and properties:

* [listProjects](Project.md#listprojects)
* [createProject](Project.md#createproject)
* [serialize](Project.md#serialize)
* [serializeList](Project.md#serializelist)

## Instance Methods

### <a id="constructor"></a>constructor: `Project(credentials, id)`

#### Arguments

1. `credentials` *([Credentials](../Glossary.md#credentials))*: Valid
credentials corresponding to the current user
1. `id` *(String)*: The project's ID

#### Returns

*(Project)* A Project instance

### <a id="getdatatable"></a>`getDataTable()`

See [DataTable#constructor](./DataTable.md#constructor)

```js
new Project(credentials, id).getDataTable()
```

is equivalent to

```js
new DataTable(credentials, id)
```

### <a id="delete"></a>`delete()`

#### Returns

TODO

### <a id="listusers"></a>`listUsers()`

#### Returns

`(Promise --> Object)` Resolves to the [serialized](User.md#serializeList)
API response

### <a id="share"></a>`share(email, permission)`

### Arguments

1. `email` *(String)*: Email address of the user to share with
1. `permission` *([Permission](../Glossary.md#permissions))*: Level of
access to grant the user

_NOTE:_ Node SDK only.

### <a id="unshare"></a>`unshare(userId)`

### Arguments

1. `userId` *(String)*: User ID (see [User.fetchProfile](User.md#fetchProfile)).
Not the Maker ID or email address.

_NOTE:_ Node SDK only.

## Static Methods and Properties

### <a id="listprojects"></a>`listProjects(credentials)`

#### Arguments

1. `credentials` *([Credentials](../Glossary.md#credentials))*: Valid
credentials corresponding to the current user

#### Returns

`(Promise --> Object)` Resolves to the [serialized](Project.md#serializelist)
API response

### <a id="createproject"></a>`createProject(credentials, name, [options])`

#### Arguments

1. `credentials` *([Credentials](../Glossary.md#credentials))*: Valid
credentials corresponding to the current user
1. `name` *(String)*: The name of the new project
1. `options` *(Object = `{ app: String }`)*

  `app` (default: `"blank"`): The base app for the project

#### Returns

`(Promise --> Object)` Resolves to the [serialized](Project.md#serialize) API
response

### <a id="serialize"></a>`serialize`

Set to override how the SDK serializes single-entity project API responses, such
as `createProject`.

By default, this will return an `Object` with the structure:

```js
type ProjectResponse = {
  id: String,
  name: String,
  creatorId: String,
  creatorName: String,
  timeCreated: Date,
  timeUpdated: Date,
}
```
<!-- TODO: remove disabled -->

See [Serialization](../advanced/Serialization.md) for more information.

### <a id="serializelist"></a>`serializeList`

Set to override how the SDK serializes multiple-entity project API responses,
such as `listProjects`.

By default, this will return an `Object` with the structure:

```js
type ProjectsResponse = {
  entities: ProjectResponse[],
}
```

See [Serialization](../advanced/Serialization.md) for more information.
