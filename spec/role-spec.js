describe('Role', function() {

  var currentUserId = 1,
    adminAbilities,
    guestAbilities,
    userAbilities;

  beforeEach(function() {
    Role.reset();

    guestAbilities = {
      books: {
        read: true,
        update: false
      }
    };

    userAbilities = {
      books: {
        read: true,
        update: function(book) {
          return book.authorId === currentUserId;
        }
      }
    };

    adminAbilities = {
      books: {
        update: true
      },
      users: {
        read: true,
        update: true
      }
    };
  });

  describe('#merge', function() {
    var merge = Role.merge;

    it('runs 2-level deep merging', function() {
      var role = merge(guestAbilities, {
        books: {
          update: true
        }
      });

      expect(role).toEqual({
        books: {
          read: true,
          update: true
        }
      });
    });

    it('removes ability if it is false', function() {
      var role = merge(adminAbilities, {
        books: false
      });

      expect(role).toEqual({
        users: adminAbilities.users
      });
    });

  });

  describe('#define', function() {

    it('stores role', function() {
      Role.define('user', userAbilities);
      expect(Role.roles.user).toEqual(userAbilities);
    });

    it('raises error when create same-name role', function() {
      Role.define('user', userAbilities);
      expect(function() {
        return Role.define('user', userAbilities);
      }).toThrow();
    });

    it('merges into parent roles', function() {
      Role.define('guest', guestAbilities);
      Role.define('user', 'guest', adminAbilities);

      expect(Role.roles.user).toEqual({
        books: {
          read: true,
          update: true
        },
        users: {
          read: true,
          update: true
        }
      });
    });

  });

  describe('#reset', function() {

    beforeEach(function() {
      Role.reset();
    });

    it('drops roles list', function() {
      expect(Role.roles).toEqual({});
    });

    it('reset current user to guest', function() {
      expect(Role.current).toEqual('guest');
    });

  });

  describe('#can', function() {
    var can = Role.can;

    beforeEach(function() {
      Role.current = 'user';
      Role.define('guest', guestAbilities);
      Role.define('user', 'guest', userAbilities);
      Role.define('admin', 'user', adminAbilities);
    });

    it('allows if set to true', function() {
      expect(can('read', 'books')).toBeTruthy();
    });

    it('does not allow if set to false', function() {
      expect(can('update', 'users')).toBeFalsy();
    });

    it('allows if executed fn is true', function() {
      expect(can('update', 'books', {
        authorId: currentUserId
      })).toBeTruthy();
    });

    it('does not allow if executed fn is false', function() {
      expect(can('update', 'books', {
        authorId: Math.random()
      })).toBeFalsy();
    });

    it('allows if any of current roles allowed', function() {
      Role.current = ['user', 'admin'];

      expect(can('update', 'books', {
        authorId: Math.random()
      })).toBeTruthy();
    });

  });
});
