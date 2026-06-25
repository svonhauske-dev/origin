// Metro config for the Origin mobile (Expo) app.
//
// KEYSTONE OF THE "DON'T TOUCH THE WEB APP" STRATEGY:
// The mobile app shares the web app's pure-JS logic (config.js, lib/time.js,
// lib/adherence.js, design-system token VALUES) by READING it from ../src
// through the in-project `shared` symlink (→ ../src). We never copy or edit
// those files. The `shared` → ../src import alias is handled in babel.config.js
// (babel-plugin-module-resolver).
//
// React / React Native always resolve from THIS project's node_modules
// (nodeModulesPaths), so there is no duplicate-React risk — the shared files
// are pure logic and import no framework code.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const webSrc = path.resolve(projectRoot, '..', 'src'); // the web app's shared logic (read-only)

const config = getDefaultConfig(projectRoot);

// Watch ../src so the shared files (reached via the `mobile/shared` symlink)
// are crawlable and hot-reload.
config.watchFolders = [webSrc];

// Resolve dependencies only from the mobile project's node_modules.
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

// Follow the `mobile/shared` symlink into ../src.
config.resolver.unstable_enableSymlinks = true;

// SDK 53 ships an OLD Hermes (hermesc, LLVM 8.0.0svn) that does NOT support ES
// private class fields (`#x`). Metro's default `hermes-stable` transform profile
// leaves private syntax in (assuming Hermes handles it) → hermesc/runtime errors
// "private properties are not supported". Forcing the `default` profile makes
// Babel fully transpile private fields away before Hermes sees them. Affects the
// JS bundle only (no native rebuild needed); the device Hermes engine has the
// same limitation, so this fixes runtime too.
config.transformer.unstable_transformProfile = 'default';

module.exports = config;
