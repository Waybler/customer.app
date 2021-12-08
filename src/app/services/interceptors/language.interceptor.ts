import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, mergeMap } from 'rxjs/operators';
import { LocaleService } from '../locale.service';

@Injectable({
    providedIn: 'root'
})
export class LanguageInterceptor implements HttpInterceptor {
    constructor(private localeService: LocaleService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.localeService.locale$.pipe(
            take(1),
            mergeMap(locale => {
                if (locale != null) {
                    var newHeaders = req.headers.set(
                        'Accept-Language', locale.language
                    );
                    const clonereq = req.clone({ headers: newHeaders });
                    return next.handle(clonereq);
                } else {
                    return next.handle(req);
                }
            })
        );
    }
}
