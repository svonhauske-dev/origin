// Babel config for the Origin mobile (Expo) app.
//
// The `module-resolver` alias maps `shared` → the in-project `shared` symlink
// (→ ../src), so the mobile app imports the web app's shared pure-JS logic with
// clean specifiers (`import { CORE_SLOTS } from 'shared/config'`). The web app
// is never edited; we only read from ../src.

const path = require('path');

// The shared web api.js (../src/lib/api.js) uses Vite's `import.meta.env.DEV`
// inside its dev-only logger. RN/Hermes has no `import.meta.env`, so calling
// those auth functions would throw "Cannot read properties of undefined". This
// tiny transform rewrites every `import.meta` to an object exposing `.env.DEV`
// (mapped to RN's `__DEV__`), so the shared file runs UNCHANGED.
function inlineImportMetaEnv() {
  return {
    name: 'inline-import-meta-env',
    visitor: {
      MetaProperty(p) {
        p.replaceWithSourceString(
          '({ env: { DEV: typeof __DEV__ !== "undefined" ? __DEV__ : false } })'
        );
      },
    },
  };
}

module.exports = function (api) {
  api.cache(true);
  return {
    // unstable_transformImportMeta lets babel-preset-expo accept `import.meta`
    // syntax (otherwise it throws "import.meta is not supported in Hermes").
    // Our inlineImportMetaEnv plugin (below, runs first) rewrites it to an
    // object exposing `.env.DEV` so the shared api.js logger works.
    presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
    plugins: [
      inlineImportMetaEnv,
      // NOTE: do NOT add explicit class-fields/private transforms here. SDK 53's
      // Hermes needed them (loose) to strip `#private`, but loose class-properties
      // transpiles class fields as plain assignments, which on RN 0.81 collides
      // with React Native's own `Object.defineProperty(Event,'NONE',{writable:false})`
      // → "Cannot assign to read-only property 'NONE'" crash on launch. SDK 54's
      // Hermes supports private fields natively, so babel-preset-expo handles
      // class fields correctly on its own.
      [
        'module-resolver',
        {
          alias: {
            // In-project symlink (→ ../src). Absolute path so resolution is
            // unambiguous regardless of which file does the importing.
            shared: path.resolve(__dirname, 'shared'),
          },
        },
      ],
    ],
  };
};
