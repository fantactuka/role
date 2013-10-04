Role.js [![Build Status](https://travis-ci.org/fantactuka/role.png?branch=master)](https://travis-ci.org/fantactuka/role)
==================

Role allows you to manage user's access depending on his current roles and abilities map

## Installation
Using [Bower](http://twitter.github.com/bower/) `bower install role` or just copy [role.js](https://raw.github.com/fantactuka/role/master/role.js)

## Usage
```js
// Defining current user role ("guest" by default)
Role.current = "admin";

// or
Role.current = ["user", "moderator"];

// or
var CurrentUser = require('my-current-user-instance');
Role.current = function() {
  return CurrentUser.roles;
}

// Defining roles with entity->action mapping
Role.define("user", {
  books: {
    read: true,
    update: function(book) {
      return book.authorId == CurrentUser.id
    }
  }
});

// Inheriting existing models
Role.define("admin", "user" {
  books: {
    update: true
  }
});

// After that you're able to use "can" helper to check if current user's role is allowed to
// perform actions on passed entities.
// E.g. somewhere in code:

if (Role.can("read", "books")) {
  ...
}

// or

var book = books.get(1);

if (Role.can("update", "books", book)) {
  ...
}
```

## Running tests
You can use karma runner via

```bash
npm install && grunt test
```
