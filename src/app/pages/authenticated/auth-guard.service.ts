import {Injectable} from '@angular/core';
import {CanActivate, Route, CanLoad, ActivatedRouteSnapshot} from '@angular/router';
import {NavController} from '@ionic/angular';
import {UserService, VerifyTokenStatus} from 'src/app/services/user.service';
import {switchMap, mergeMap, map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {LocaleService} from 'src/app/services/locale.service';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {
  constructor(
    private userService: UserService,
    private navController: NavController,
    private localeService: LocaleService
  ) {
  }

  canLoad(route: Route): boolean {
    return true;
  }

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return of(false).pipe(
      switchMap(async _ => {
        if (route.queryParams['token'] != null) {
          await this.userService.setToken(route.queryParams['token']);
        }

        if (route.queryParams['locale'] != null) {
          await this.localeService.setLocaleFromLanguage(route.queryParams['locale']);
        }

        return false;
      }),
      mergeMap(_ => {
        return <Observable<boolean>> this.userService.verifyTokenStatus$.pipe(
          map(x => {
            if (x === VerifyTokenStatus.Success) {
              return true;
            }

            this.navController.navigateRoot('/');
            return false;
          })
        );
      })
    );
  }
}
