import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { ToastController, NavController } from '@ionic/angular';
import {  vendor } from 'src/environments/environment';

import { TranslatorFactoryService, ITranslator } from '../translator-factory.service';
import { UserService } from '../user.service';
import { HTTP_STATUS_CODE } from '../../models/api';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private t: ITranslator;

  constructor(
    private toastController: ToastController,
    translatorFactoryService: TranslatorFactoryService,
    private navController: NavController,
    private userService: UserService,
  ) {
    this.t = translatorFactoryService.create('http-error-interceptor');
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        retry(1),
        catchError((error: HttpErrorResponse) => {
          if (error === null) {
            return throwError('');
          }

          let errorMessage = '';

          if (error.error instanceof ErrorEvent) {
            // client-side error
            errorMessage = this.t('client-error');
          } else if (error.status === 0) {
            errorMessage = this.t('communication-error', { vendorName: vendor.vendorName });
          } else if (error.status === HTTP_STATUS_CODE.Unauthorized) {
            this.userService.logout();
            this.navController.navigateRoot('/');
            return throwError('');
          } else if (error.status === HTTP_STATUS_CODE.NotFound || error.status === HTTP_STATUS_CODE.BadRequest) {
            return throwError(error);
          } else {
            // server-side error
            errorMessage = this.t('server-error', { vendorName: vendor.vendorName });
          }

          setTimeout(async () => {
            const t = await this.toastController.create({
              message: errorMessage,
              // showCloseButton: false,
              position: 'top',
              cssClass: 'danger',
              duration: 2000,
            });
            await t.present();
          }, 100);

          return throwError(errorMessage);
        }),
      );
  }
}
