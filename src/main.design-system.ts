import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { DesignSystem } from './app/design-system/design-system';

bootstrapApplication(DesignSystem, {
  providers: [provideBrowserGlobalErrorListeners()],
}).catch((err) => console.error(err));
