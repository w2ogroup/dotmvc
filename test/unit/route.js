var Route = require('../../lib/Route.js');

QUnit.module('Route');

test('Route regex is cached', function() {

  var route = new Route();
  route.pattern = 'something/{a}';

  strictEqual(route.getPatternRegExp(), route.getPatternRegExp(), 'yah');
  ok(route.getPatternRegExp() instanceof RegExp, 'made it');

});

test('Compiling the pattern', function() {

  var compile = function(pattern) {
    var route = new Route();
    route.pattern = pattern;
    return route.getPatternRegExp();
  };

  // fuck them slashes
  strictEqual(compile('route').test('route'), true);
  strictEqual(compile('route').test('/route'), true);
  strictEqual(compile('route').test('route/'), true);
  strictEqual(compile('route').test('/route/'), true);
  strictEqual(compile('route').test('shit'), false);
  strictEqual(compile('route').test('routeshit'), false);
  strictEqual(compile('route').test('shitroute'), false);

  // 1 or more normal params, lose the first parenth
  strictEqual(compile('route/{a}').test('route/something'), true);
  strictEqual(compile('route/{a}').test('/route/something'), true);
  strictEqual(compile('/route/{a}').test('route/something'), true);
  strictEqual(compile('/route/{a}').test('/route/something'), true);
  strictEqual(compile('/route/{a}').test('wrong/something'), false);
  strictEqual(compile('/route/{a}').test('route'), false);
  strictEqual(compile('/route/{a}').test('route/'), false);

  strictEqual(compile('/route/{a}').test('/route/something with spaces'), true);
  strictEqual(compile('/route/{a}').test('/route/something-dashed'), true);
  strictEqual(compile('/route/{a}').test('/route/something-dashed@weird !'), true);
  strictEqual(compile('/route/{a}').test('/route/something/too/much'), false);

  strictEqual(compile('route/{a}').exec('route/something')[1], 'something', true);
  strictEqual(compile('route/{a}/{b}').exec('route/something/else')[1], 'something', true);
  strictEqual(compile('route/{a}/{b}').exec('/route/something/else/')[1], 'something', true);
  strictEqual(compile('route/{a}/{b}').exec('/route/something missing'), null);

  strictEqual(compile('some/long/prefix/{a}').test('some/long/prefix/something'), true);

  strictEqual(compile('route/{a?}').test('route'), true, 'a');
  strictEqual(compile('route/{a?}').test('/route'), true, 'b');
  strictEqual(compile('route/{a?}').test('/route/'), true, 'c');
  strictEqual(compile('route/{a?}').test('route/something'), true, 'd');
  strictEqual(compile('route/{a?}').test('/route/something'), true, 'e');
  strictEqual(compile('route/{a?}').test('/route/something/'), true, 'f');

  strictEqual(compile('route/{a}/{b?}').test('route/something/else'), true);
  strictEqual(compile('route/{a}/{b?}').test('route/something/'), true);
  strictEqual(compile('route/{a}/{b?}').test('route/something'), true);

  strictEqual(compile('route/{a}/{b?}').exec('route/something/else')[1], 'something');
  strictEqual(compile('route/{a}/{b?}').exec('route/something/else')[2], 'else');

  strictEqual(compile('route/{a...}').test('route/lots of rando shit!'), true);
  strictEqual(compile('route/{a...}').test('route/lots / / /of rando shit!'), true);
  strictEqual(compile('route/{a...}').test('route'), false);
  strictEqual(compile('route/{a...}').test('route/'), false);
  var rando = '$ $$$ ... asdfa !!!! / / / //df df df / asdf ';
  strictEqual(compile('route/{a...}').exec('route/' + rando)[1], rando);

  strictEqual(compile('route/{a...?}').test('route/lots of rando shit!'), true);
  strictEqual(compile('route/{a...?}').test('route'), true);
  strictEqual(compile('route/{a...?}').test('route/'), true);

  strictEqual(compile('route/{a}/{b}/{c...?}').test('route/1'), false, '1');
  strictEqual(compile('route/{a}/{b}/{c...?}').test('route/1/'), false, '2');
  strictEqual(compile('route/{a}/{b}/{c...?}').test('route/1/2'), true, '3');
  strictEqual(compile('route/{a}/{b}/{c...?}').test('route/1/2/'), true, '4');
  strictEqual(compile('route/{a}/{b}/{c...?}').test('route/1/2/3'), true, '5');
  strictEqual(compile('route/{a}/{b}/{c...?}').test('route/1/2/3/4/5'), true, '6');
});

test('Getting params from URI', function() {

  function get(pattern) {
    var route = new Route();
    route.pattern = pattern;
    return route.getParameterList();
  }

  deepEqual(get('test/{a}'), ['a']);
  deepEqual(get('test/{a...}'), ['a']);
  deepEqual(get('test/{a?}'), ['a']);

  deepEqual(get('test/{a}/{b}'), ['a', 'b']);
  deepEqual(get('test/{a?}/{b}'), ['a', 'b']);
  deepEqual(get('test/{a...}/{b}'), ['a', 'b']);

  deepEqual(get('test/{a}/{b?}'), ['a', 'b']);
  deepEqual(get('test/{a?}/{b...}'), ['a', 'b']);
  deepEqual(get('test/{a...}/{b?}'), ['a', 'b']);

});

test('Param mapping', function() {

  function get(pattern, uri) {
    var route = new Route();
    route.pattern = pattern;
    return route.getParamsFromUri(uri);
  }

  var rando = 'bu asdf ajsd $ d asdf fdasdf ||| @@';
  var rest = 'lox lllts/o  $ f/more/crap $  $$ @@ ||| ...';
  deepEqual(get('test/{a}', 'test/something'), {a: 'something'});
  deepEqual(get('test/big/prefix/{a}', 'test/big/prefix/something'), {a: 'something'});
  deepEqual(get('test/{a}', 'test/' + rando), {a: rando});
  deepEqual(get('test/big/prefix/{a}', 'test/something'), null);
  deepEqual(get('test/{a}', 'test/'), null);
  deepEqual(get('test/{a}', 'test'), null);

  deepEqual(get('test/{a}/{b}', 'test/real/legit'), { a: 'real', b: 'legit' });
  deepEqual(get('test/{a}/{b}', 'test/' + rando + '/legit'), { a: rando, b: 'legit' });

  deepEqual(get('test/{a}/{b?}', 'test/real/legit'), { a: 'real', b: 'legit' });
  deepEqual(get('test/{a}/{b?}', 'test/real'), { a: 'real', b: undefined });
  deepEqual(get('test/{a}/{b?}', 'test/real/nice/NOPE'), null);

  deepEqual(get('test/{a}/{b...}', 'test/real/nice/NOPE'),
    {a: 'real', b: 'nice/NOPE'});
  deepEqual(get('test/{a}/{b...}', 'test/real/'), null);
  deepEqual(get('test/{a}/{b...}', 'test/real'), null);

});

test('Where clause', function() {

  function check(pattern, wheres, uri) {
    var route = new Route();
    route.pattern = pattern;
    for (var key in wheres) {
      route.where(key, wheres[key]);
    }
    return !!route.getParamsFromUri(uri);
  }

  ok(check('test/{id}', { id: /^\d+$/ }, 'test/123'));
  ok(!check('test/{id}', { id: /^\d+$/ }, 'test/ab'));
  ok(!check('test/{id}', { id: /^\d+$/ }, 'test/1a'));

  ok(!check('test/{id}', {id: function(id) { return id > 5; }}, 'test/3'));
  ok(check('test/{id}', {id: function(id) { return id > 5; }}, 'test/9'));

});

test('Default', function() {

  function check(pattern, defs, uri) {
    var route = new Route();
    route.pattern = pattern;
    for (var key in defs)
      route.default(key, defs[key]);
    return route.getParamsFromUri(uri);
  }


  deepEqual(check('test/{name?}', { name: 'bob' }, 'test'), { name: 'bob' });
  deepEqual(check('test/{name?}', { name: 'bob' }, 'test/bill'), { name: 'bill' });

  deepEqual(check('test/{name}/is/{verb?}', { verb: 'coding' }, 'test/bill/is/barfing'),
    { name: 'bill', verb: 'barfing' });
  deepEqual(check('test/{name}/is/{verb?}', { verb: 'coding' }, 'test/bill/is'),
    { name: 'bill', verb: 'coding' });

});

test('Routing', function() {

  var ACTION = {};

  var route = new Route('user/{id}/{action?}/{opts...?}', ACTION)
    .where('id', /^\d+$/)
    .where('action', /^profile|friends|photos$/)
    .default('action', 'profile')
    .named('userPage');

  deepEqual(route.getParamsFromUri('user/123'),
    { id: '123', action: 'profile', opts: undefined });
  deepEqual(route.getParamsFromUri('user/123/photos'),
    { id: '123', action: 'photos', opts: undefined });
  deepEqual(route.getParamsFromUri('user/123/photos/2014/01/nye-party'),
    { id: '123', action: 'photos', opts: '2014/01/nye-party' });

  strictEqual(route.getUriFromParams({ id: 123 }),
    'user/123/profile');
  strictEqual(route.getUriFromParams({ id: 123, action: 'photos'}),
    'user/123/photos');
  strictEqual(route.getUriFromParams({ id: 123, opts: 'a/b/c/awesome!' }),
    'user/123/profile/a/b/c/awesome!');

  throws(function() {
    route.getUriFromParams({ id: 'asdf' });
  }, 'invalid wheres for reverse route');

});
