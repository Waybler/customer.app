import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { UserService } from '../user.service';
import { environment, vendor } from 'src/environments/environment';
import { take, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // do not intercept request whose urls are filtered by the injected filter
    let newHeaders;
    const urlIsForAPI = req.url.startsWith(environment.apiUrl);
    if (urlIsForAPI) {
      if (vendor?.vendorAppId) {
        newHeaders = req.headers.set(
          'X-App-Secret', vendor.vendorAppId,
        );
      } else {
        const errorText = 'Lacking vendorAppId. This value is set in environments.ts';
        console.error(errorText);
        throw(errorText);
      }
    }

    if (!this.userService.tokenSubject?.value) {
      const clonereq = req.clone({ headers: newHeaders });
      return next.handle(clonereq);

    } else {
      return this.userService.token$.pipe(
        take(1),
        mergeMap(token => {
          if (token != null && urlIsForAPI) {
            newHeaders = newHeaders.set(
              'X-CaCharge-Token', token,
            );

            const clonereq = req.clone({ headers: newHeaders });
            return next.handle(clonereq);
          } else {
            const clonereq = req.clone({ headers: newHeaders });
            return next.handle(clonereq);
          }
        }),
      );
    }
  }

  protected get userService(): UserService {
    return this.injector.get(UserService);
  }
}
