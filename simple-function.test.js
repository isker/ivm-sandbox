const ivm = require("isolated-vm");
const test = require("ava");

const isolate = new ivm.Isolate();
const script = isolate.compileScriptSync('console("buh")');

let context;
test.beforeEach(() => {
  context = isolate.createContextSync();
});

test("works with callback", (t) => {
  t.plan(0);

  const foo = (...args) => console.log(...args);
  context.global.setSync("console", new ivm.Callback(foo));
  script.runSync(context);
});

test("implicitly wraps with callback", (t) => {
  t.plan(0);

  const foo = (...args) => console.log(...args);
  context.global.setSync("console", foo);
  script.runSync(context);
});

test("fails with direct reference to console.log", (t) => {
  t.plan(1);

  t.throws(
    () => context.global.setSync("console", console.log),
    { instanceOf: TypeError },
    // ???
    "`setSync` requires parameter 3 to be a string"
  );
});

test("fails with indirect reference to console.log", (t) => {
  t.plan(1);

  const hmm = console.log;
  t.throws(
    () => context.global.setSync("console", hmm),
    { instanceOf: TypeError },
    // ???
    "`setSync` requires parameter 3 to be a string"
  );
});

test("fails with any property value (?)", (t) => {
  t.plan(1);

  const thonk = { log: console.log };

  t.throws(
    () => context.global.setSync("console", thonk.log),
    { instanceOf: TypeError },
    // ???
    "`setSync` requires parameter 3 to be a string"
  );
});

test("fails with any property value (?) explicitly wrapped in callback", (t) => {
  t.plan(1);

  const thonk = { log: console.log };

  t.throws(
    () => context.global.setSync("console", new ivm.Callback(thonk.log)),
    { instanceOf: TypeError },
    // ???
    "`setSync` requires parameter 3 to be a string"
  );
});

test("old reference method works with property value", (t) => {
  t.plan(0);

  context.evalClosureSync(
    `globalThis.console = function(...args) {
	$0.applyIgnored(undefined, args, { arguments: { copy: true } });
}`,
    [console.log],
    { arguments: { reference: true } }
  );
  script.runSync(context);
});
