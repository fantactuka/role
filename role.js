(function(factory) {
  if (typeof define === 'function' && define.amd) {
    define(['underscore'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('underscore'));
  } else {
    factory(window._);
  }
})(function(_) {

  /**
   * Role allows you to manage user's access depending on his current roles and abilities map
   *
   * @example
   *
   *    var CurrentUser = require('my-current-user-instance');
   *
   *    // Defining current user role ("guest" by default)
   *    Role.current = "admin";
   *
   *    // or
   *    Role.current = ["user", "moderator"];
   *
   *    // or
   *    Role.current = function() {
   *      return CurrentUser.roles;
   *    }
   *
   *    // Defining roles with entity->action mapping
   *    Role.define("user", {
   *      books: {
   *        read: true,
   *        update: function(book) {
   *          return book.authorId == CurrentUser.id
   *        }
   *      }
   *    });
   *
   *    // Inheriting existing models
   *    Role.define("admin", "user" {
   *      books: {
   *        update: true
   *      }
   *    });
   *
   *    // After that you're able to use "can" helper to check if current user's role is allowed to
   *    // perform actions on passed entities.
   *    // E.g. somewhere in code:
   *
   *    if (Role.can("read", "books")) {
   *      ...
   *    }
   *
   *    // or
   *
   *    var book = books.get(1);
   *
   *    if (Role.can("update", "books", book)) {
   *      ...
   *    }
   *
   * @type {{}}
   */

  var Role = window.Role = {};

  /**
   * Available roles storage. Object tree, that stores information in the following format:
   *  - roleName -> entityName -> abilitiesList:
   *
   *  {
   *    guest: {
   *      book: {
   *        read: true,
   *        update: false
   *      }
   *    },
   *
   *    user: {
   *      book: {
   *        read: true,
   *        update: function(book) {
   *          return book.id === CurrentUser.id
   *        }
   *      }
   *    }
   *  }
   *
   * @type {{}}
   */
  Role.roles = {};

  /**
   * Merging roles list in 2-level deepness. If entity's abilities list is set to false or null
   * it erase all abilities. E.g. in case want to disallow doing anything with books:
   *
   * `Role.merge({ books: { read: true } }, { books: false });` will remove 'books' entity abilities
   *
   * @returns {{}}
   */
  Role.merge = function() {
    return _.chain([arguments]).flatten().inject(function(result, role) {
      _.each(role, function(abilities, name) {
        if (abilities === false || abilities === null) {
          delete result[name];
        } else {
          result[name] = _.extend(result[name] || {}, abilities);
        }
      });

      return result
    }, { }).value();
  };

  /**
   * Defining role via object literal, or using existing roles, or both. First argument is a role name,
   * while the rest could be roles object literals, or role names to extend from
   *
   * @param name
   */
  Role.define = function(name) {
    if (Role.roles[name]) {
      fail('Role %s already exists', name);
    }

    var abilities = _.chain(arguments).tail().map(function(ability) {
      return _.isObject(ability) ? ability : Role.roles[ability];
    }).value();

    Role.roles[name] = Role.merge(abilities);
  };

  /**
   * Reset roles list and current user's role
   */
  Role.reset = function() {
    Role.current = "guest";
    Role.roles = {};
  };

  /**
   * Checking if current user roles allow running action on passed entity. Will
   * return true if *any* of user roles allow to perform action.
   *
   * @param action {String} entity's action name, e.g. "read", "update", etc
   * @param entity {String} entity name to check access for, e.g. books, users, etc
   * @returns {*}
   */
  Role.can = function(action, entity) {
    var currentRoles = _.result(Role, 'current'),
      abilityArgs = _.toArray(arguments).slice(2);

    return _.chain([currentRoles]).flatten().any(function(roleName) {
      var role = Role.roles[roleName],
        ability = role && role[entity] && role[entity][action];

      if (_.isFunction(ability)) {
        ability = ability.apply(null, abilityArgs);
      }

      return !!ability;
    }).value();
  };


  function fail(message) {
    var variables = _.tail(arguments),
      string = message.replace(/%s/g, function() {
        return variables.shift();
      });

    throw new Error(string);
  }


  return Role;

});
