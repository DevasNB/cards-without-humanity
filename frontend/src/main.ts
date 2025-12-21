import { bootstrapApplication } from '@angular/platform-browser';
// TODO: "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"

import { App } from './app/app';
import { appConfig } from './app/app.config';

try {
  await bootstrapApplication(App, appConfig);
} catch (err) {
  console.error(err);
}
