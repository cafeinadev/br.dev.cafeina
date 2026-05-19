import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

const mockupImageLoader = (config: ImageLoaderConfig): string => {
  if (config.src.includes('/brand/mockups/') && config.width && config.width <= 800) {
    return config.src.replace('-1600.webp', '-800.webp');
  }
  return config.src;
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    { provide: IMAGE_LOADER, useValue: mockupImageLoader },
  ],
};
