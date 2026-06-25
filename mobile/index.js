// MUST be first: installs the synchronous global.localStorage shim before any
// module (App → shared/lib/api) touches it.
import './storage-shim';

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
