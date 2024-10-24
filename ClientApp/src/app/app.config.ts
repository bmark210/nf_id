import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideNgxMask } from 'ngx-mask';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './core/Interceptors/token.interceptor';
import { CookieService } from 'ngx-cookie-service';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from './core/services/auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideNgxMask(),
    NoopAnimationsModule,
    CookieService,
    AuthService,
    provideHttpClient(withFetch(), withInterceptors([tokenInterceptor])),
    importProvidersFrom(BrowserAnimationsModule),
  ],
};
