import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from '@app/app.component';
import { appConfig } from '@app/app.component.config';
import { CookieService } from '@services/cookie.service';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@app/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    CookieService,
    // withFetch() para SSR; authInterceptor anexa o token JWT automaticamente
    provideHttpClient(withFetch(), withInterceptors([authInterceptor]))
  ]
}).catch(err => console.error(err));
