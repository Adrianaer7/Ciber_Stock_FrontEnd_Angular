import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authRequestInterceptor } from './auth/interceptors/authRequest.interceptor';
import { authResponseInterceptor } from './auth/interceptors/authResponse.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authRequestInterceptor,
        authResponseInterceptor
      ])
    ),
    { provide: LOCALE_ID, useValue: 'es-AR' },  //para usar los pipes que formatean
  ]
};
