# please read this before making any changes to the source code of xerakt

...

## important remarks on how not to introduce new bugs:

- don't detach the `.ensure()` method from an `ensurer` object, even with `.bind(ensurer)`, `.call(ensurer)` &c., because `.ensure` is **not** a readonly property and it may change over time; the only valid way is to explicitly write `ensurer.ensure(/*...*/)` (or `ensurer["ensure"](/*...*/)` &c.) for being sure that you are using the latest assigned `.ensure()` method
- same for `enforcer.enforce()` — it also can change over time
- same for `proclaimer.proclaim()` and for `demander.demand()` — in future versions of xerakt they also may change over time

...

## incrementing version

when incrementing the package version with `npm version`, don't forget to:

- manually change the string `import xerakt from "https://unpkg.com/xerakt@version/esm.js";` in `readme.md` to match the new version (and the file structure in the package, if any changes were made to it)
- make sure that demo projects are using appropriate version and are working fine