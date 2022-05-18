import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, from, Observable, of, Subject } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, first, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import * as Moment from 'moment';

import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';
import { ILocale, LocaleService } from './locale.service';
import { USER_APP_SETTINGS_PROPERTY, UserAppSettings, UserAppSettingsAPIResponse, UserAuthenticateVerifyAPIResponse } from '../models/user';
import { IWebSocketTypeOfUserUpdated } from '../models/webSocket';
import { ChargeZone, GetChargeZoneInfoAPIResponse, StationsAvailableObject } from '../models/chargeZone';
import { API, HTTP_STATUS_CODE } from '../models/api';
import { TermsAndConditions } from '../models/contract';
import { HistoryChartDatum, HistoryForMonthAPIResponse, HistoryForMonthGUIModel } from '../models/history';
import {
  BillingInvoicesAPIResponse,
  Invoice,
  PAYMENT_METHOD_STATUS,
  PaymentMethod,
  PaymentMethodCreditCard,
  PaymentMethodsAPIResponse,
  UninvoicedAPIResponse,
} from '../models/payment';
import { APIBodyChargeSessionStart, ChargeSessionStartParams, ChargeSessionStopParams } from '../models/chargeSession';

// import { LocaleService } from './locale.service';
export interface UserServiceCache {
  stationsObject: StationsAvailableObject;
}

export enum LoginResult {
  Success,
  InvalidCredentials
}

export enum ResetPasswordResult {
  Success,
  NotFound
}

export enum SetPasswordResult {
  Success,
  NotMatching,
  Invalid,
  UnknownError
}

export enum RegisterResult {
  Success,
  ExistingAccount,
  UnknownError
}

export enum StartChargeResult {
  Success,
  Failed
}

export enum StopChargeResult {
  Success,
  Failed
}

export enum StatusResult {
  None,
  Information,
  Fatal
}

export enum VerifyTokenStatus {
  Unknown,
  NoToken,
  Success,
  InvalidToken,
  Failed
}

export class StatusResultWithMessage {
  public Status: StatusResult;
  public Title: string;
  public Message: string;
}

export enum ZONE_CODE_ERROR {
  EXISTING = 'EXISTING',
  NOTFOUND = 'NOTFOUND',
  UNAUTHORIZED = 'UNAUTHORIZED'
}

export enum ZoneInfoStatus {
  Valid,
  Existing,
  NotFound,
  Unauthorized
}

export class ZoneInfo {
  public Status: ZoneInfoStatus;
  public Data: GetChargeZoneInfoAPIResponse;
}

export enum STORAGE_SERVICE_KEY {
  ADVANCED = 'advanced',
  AUTH_TOKEN = 'authToken',
  BETA = 'beta',
  CHARGE_OPTIONS = 'chargeOptions',
  FILTER = 'filter',
  LEGAL_ENTITY_ID = 'legalEntityId',
  MIGRATED_TO_USER_APP_SETTINGS = 'migratedToUserAppSettings',
  SHOULD_USE_COMPACT_VIEW = 'shouldUseCompactView',
  USER_APP_SETTINGS = 'userAppSettings',
}

export const USER_APP_SETTINGS_DEFAULT_VALUE = {
  compactViewLimit: 10,
};

const cache: UserServiceCache = {
  stationsObject: null,
};

const now = Moment();
const currentTimeObject = {
  now,
  beginningOfMonth: now.startOf('month'),
};

function getPaymentMethodStatus(paymentMethod: PaymentMethodCreditCard): PAYMENT_METHOD_STATUS {
  const expirationDateString = paymentMethod?.expirationDate;
  if (!paymentMethod || !expirationDateString) {
    return PAYMENT_METHOD_STATUS.PAYMENT_METHOD_IS_MISSING;
  }
  const expirationDate = Moment(expirationDateString);
  const beginningOfThisMonth = currentTimeObject.beginningOfMonth;
  const beginningOfExpirationDateMonth = Moment(expirationDate).startOf('month');

  const expirationDateIsThisMonth = beginningOfExpirationDateMonth.isSame(beginningOfThisMonth);
  const expirationDateIsInTheFuture = beginningOfExpirationDateMonth.isAfter(beginningOfThisMonth);
  const expirationDateIsInThePast = beginningOfExpirationDateMonth < beginningOfThisMonth;

  let expirationStatus = PAYMENT_METHOD_STATUS.OK;
  let expirationWasLastMonth = false;

  if (expirationDateIsInTheFuture) {
    // Do nothing as we want to use the default status, but return so we do not waste resources
    return expirationStatus;
  } else if (expirationDateIsThisMonth) {
    expirationStatus = PAYMENT_METHOD_STATUS.PAYMENT_METHOD_ABOUT_TO_EXPIRE;
  } else {
    const yearOfExpiration = expirationDate.year();
    const thisYear = beginningOfThisMonth.year();

    const monthOfExpiration = expirationDate.month() + 1;
    const thisMonth = beginningOfThisMonth.month() + 1;

    if ((thisYear > yearOfExpiration) && (monthOfExpiration !== 12)) {
      expirationStatus = PAYMENT_METHOD_STATUS.PAYMENT_METHOD_EXPIRED_MORE_THAN_ONE_MONTH_AGO;
    } else {
      const expirationYearWasLastYear = (thisYear - yearOfExpiration) === 1;

      if (expirationYearWasLastYear) {
        if (thisMonth === 1 && monthOfExpiration === 12) {
          expirationWasLastMonth = true;
        }
      } else {
        if ((thisMonth - monthOfExpiration) === 1) {
          expirationWasLastMonth = true;
        }
      }

      expirationStatus = expirationWasLastMonth
        ? PAYMENT_METHOD_STATUS.PAYMENT_METHOD_EXPIRED_LAST_MONTH
        : PAYMENT_METHOD_STATUS.PAYMENT_METHOD_EXPIRED_MORE_THAN_ONE_MONTH_AGO;
    }

  }
  return expirationStatus;
}

async function migrateDisparateSettingsToAppSettings(appSettings: UserAppSettings, storageService: StorageService) {
  const chargeOptions = await storageService.get(STORAGE_SERVICE_KEY.CHARGE_OPTIONS);
  const filter = await storageService.get(STORAGE_SERVICE_KEY.FILTER);

  if (chargeOptions || filter) {
    // Migrate the values over to the appSettings object.
    if (chargeOptions) {
      appSettings.showCarHeating = chargeOptions;
    }
    if (filter) {
      appSettings.showCompactView = filter;
    }

  }

  return appSettings;
}

function setDefaultAppSettingsWhereApplicable(appSettings: UserAppSettings): UserAppSettings {
  if (!appSettings) {
    console.error('Function "setDefaultAppSettingsWhereApplicable" requires "appSettings" as the parameter.');
  }
  if (!appSettings.compactViewLimit) {
    appSettings.compactViewLimit = USER_APP_SETTINGS_DEFAULT_VALUE.compactViewLimit;
  }
  return appSettings;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private paymentMethodsChangedSubject = new BehaviorSubject(true);
  public paymentMethodsChanged$ = this.paymentMethodsChangedSubject.asObservable();

  private compactViewChangedSubject = new BehaviorSubject(true);
  public compactViewChanged$ = this.compactViewChangedSubject.asObservable();
  public compactView$: Observable<boolean>;

  private compactViewLimitChangedSubject = new BehaviorSubject(10);
  public compactViewLimitChanged$ = this.compactViewLimitChangedSubject.asObservable();
  public compactViewLimit$: Observable<number>;

  private chargeOptionsViewChangedSubject = new BehaviorSubject(false);
  public chargeOptionsViewChanged$ = this.chargeOptionsViewChangedSubject.asObservable();
  public chargeOptionsView$: Observable<boolean>;

  private advancedViewChangedSubject = new BehaviorSubject(false);
  public advancedViewChanged$ = this.advancedViewChangedSubject.asObservable();
  public advancedView$: Observable<boolean>;

  private betaChangedSubject = new BehaviorSubject(false);
  public betaChanged$ = this.betaChangedSubject.asObservable();
  public beta$: Observable<boolean>;

  public paymentMethods$: Observable<PaymentMethodCreditCard[]>;
  public paymentMethodsStatus: BehaviorSubject<PAYMENT_METHOD_STATUS | null> = new BehaviorSubject(null);
  public uninvoiced$: Observable<UninvoicedAPIResponse>;
  public invoices$: Observable<Invoice[]>;
  public history$: Observable<HistoryForMonthGUIModel>;
  public historyPeriod$: Subject<string> = new Subject<any>();
  public currentUserTerms$: Observable<TermsAndConditions>;
  public tmp$: Observable<any>;

  public tokenSubject = new BehaviorSubject<string>(null);
  public token$: Observable<string>;

  public legalEntityIdSubject = new BehaviorSubject(null);
  public legalEntityId$: Observable<number> = this.legalEntityIdSubject.asObservable();

  public userAppSettingsSubject$ = new BehaviorSubject(null);
  public userAppSettings$: Observable<UserAppSettings>;

  public shouldUseCompactViewSubject$ = new BehaviorSubject(false);
  public shouldUseCompactView$ = this.shouldUseCompactViewSubject$.asObservable();

  public verifyTokenStatus$: Observable<VerifyTokenStatus>;
  public lastVerifiedStatus: VerifyTokenStatus = VerifyTokenStatus.Unknown;

  public userUpdated$ = new BehaviorSubject(null);

  public sessionCount = 0;

  constructor(private httpClient: HttpClient, private storageService: StorageService, private localeService: LocaleService) {
    this.legalEntityId$ = this.legalEntityIdSubject.pipe(
      switchMap(async _ => {
        return await this.storageService.get(STORAGE_SERVICE_KEY.LEGAL_ENTITY_ID);
      }));

    this.token$ = this.tokenSubject.pipe(
      switchMap(async _ => {
        return await this.storageService.get(STORAGE_SERVICE_KEY.AUTH_TOKEN);
      }));

    this.userAppSettingsSubject$.pipe(
      switchMap(async _ => {
        return await this.storageService.get(STORAGE_SERVICE_KEY.USER_APP_SETTINGS);
      }),
    );

    this.compactView$ = this.compactViewChanged$.pipe(
      mergeMap(_ => from(this.storageService.get(STORAGE_SERVICE_KEY.FILTER)).pipe(
          mergeMap(compactView => of(compactView == null ? false : compactView)),
        ),
      ),
    );
    this.compactViewChangedSubject.next(true);

    this.shouldUseCompactView$ = this.shouldUseCompactViewSubject$.pipe(
      switchMap(async _ => {
        return await this.storageService.get(STORAGE_SERVICE_KEY.SHOULD_USE_COMPACT_VIEW);
      }));
    // this.shouldUseCompactViewSubject$.next(true);

    this.chargeOptionsView$ = this.chargeOptionsViewChanged$.pipe(
      mergeMap(_ => from(this.storageService.get(STORAGE_SERVICE_KEY.CHARGE_OPTIONS)).pipe(
          mergeMap(chargeOptionsView => of(chargeOptionsView == null ? false : chargeOptionsView)),
        ),
      ),
    );
    this.chargeOptionsViewChangedSubject.next(true);

    this.advancedView$ = this.advancedViewChanged$.pipe(
      mergeMap(_ => from(this.storageService.get(STORAGE_SERVICE_KEY.ADVANCED))
        .pipe(
          mergeMap(advancedView => of(advancedView == null ? false : advancedView)),
        ),
      ),
    );
    this.advancedViewChangedSubject.next(true);

    this.beta$ = this.betaChanged$.pipe(
      mergeMap(_ => from(this.storageService.get(STORAGE_SERVICE_KEY.BETA)).pipe(mergeMap(beta => of(beta == null ? false : beta)))),
    );
    this.betaChangedSubject.next(true);

    this.verifyTokenStatus$ = this.token$.pipe(
      mergeMap(token => {
        if (token === null) {
          return of(VerifyTokenStatus.NoToken);
        }

        if (this.lastVerifiedStatus !== VerifyTokenStatus.Unknown) {
          return of(this.lastVerifiedStatus);
        }

        const url = `${environment.apiUrl}app/authenticate/status`;
        return this.httpClient.get(url, {}).pipe(
          switchMap(async (response: UserAuthenticateVerifyAPIResponse) => {
            if (response.result !== API.GENERIC_RESULT.OK) {
              this.logout();
              return VerifyTokenStatus.InvalidToken;
            } else {
              await this.setLegalEntityId(response.legalEntityId);
              return VerifyTokenStatus.Success;
            }
          }),
          catchError((error) => {
            return of(VerifyTokenStatus.Failed);
          }),
        );
      }),
      tap(status => {
        this.lastVerifiedStatus = status;

      }),
    );

    this.paymentMethods$ = combineLatest(this.legalEntityId$, this.paymentMethodsChanged$).pipe(
      mergeMap(([leid]) => {
        return this.httpClient.get(`${environment.apiUrl}${leid}/paymentmethods?includeExpired=true`).pipe(
          tap((response: PaymentMethodsAPIResponse) => {

            const paymentMethods = response.paymentMethods;
            const paymentMethodIsMissing = !paymentMethods || !paymentMethods.length;
            let hasOKPaymentMethod;
            let hasPaymentMethodAboutToExpire;
            let hasPaymentMethodAboutExpiredLastMonth;
            let hasPaymentMethodAboutExpiredMoreThanOneMonthAgo;

            if (!paymentMethodIsMissing) {
              paymentMethods.forEach((paymentMethod) => {
                const paymentMethodStatusCalculated: PAYMENT_METHOD_STATUS = getPaymentMethodStatus(paymentMethod as PaymentMethodCreditCard);
                switch (paymentMethodStatusCalculated) {
                  case   PAYMENT_METHOD_STATUS.OK: {
                    hasOKPaymentMethod = true;
                    break;
                  }
                  case   PAYMENT_METHOD_STATUS.PAYMENT_METHOD_ABOUT_TO_EXPIRE: {
                    hasPaymentMethodAboutToExpire = true;
                    break;
                  }
                  case   PAYMENT_METHOD_STATUS.PAYMENT_METHOD_EXPIRED_LAST_MONTH: {
                    hasPaymentMethodAboutExpiredLastMonth = true;
                    break;
                  }
                  case   PAYMENT_METHOD_STATUS.PAYMENT_METHOD_EXPIRED_MORE_THAN_ONE_MONTH_AGO: {
                    hasPaymentMethodAboutExpiredMoreThanOneMonthAgo = true;
                    break;
                  }
                }
              });
            }

            {
              // As we may have multiple payment methods we want to cycle through the statuses in a more measured way in some sort of priority loop
              if (paymentMethodIsMissing) {
                this.paymentMethodsStatus.next(PAYMENT_METHOD_STATUS.PAYMENT_METHOD_IS_MISSING);
              } else if (hasOKPaymentMethod) {
                this.paymentMethodsStatus.next(PAYMENT_METHOD_STATUS.OK);
              } else if (hasPaymentMethodAboutToExpire) {
                this.paymentMethodsStatus.next(PAYMENT_METHOD_STATUS.PAYMENT_METHOD_ABOUT_TO_EXPIRE);
              } else if (hasPaymentMethodAboutExpiredLastMonth) {
                this.paymentMethodsStatus.next(PAYMENT_METHOD_STATUS.PAYMENT_METHOD_EXPIRED_LAST_MONTH);
              } else if (hasPaymentMethodAboutExpiredMoreThanOneMonthAgo) {
                this.paymentMethodsStatus.next(PAYMENT_METHOD_STATUS.PAYMENT_METHOD_EXPIRED_MORE_THAN_ONE_MONTH_AGO);
              }
            }

          }),
          map((response: PaymentMethodsAPIResponse) => {
            return response.paymentMethods;
          }),
        );
      }),
    );

    this.uninvoiced$ = this.legalEntityId$.pipe(
      mergeMap(leid => this.httpClient.get(`${environment.apiUrl}${leid}/billing/uninvoiced`) as Observable<UninvoicedAPIResponse>),
    );

    this.invoices$ = this.legalEntityId$.pipe(
      mergeMap(leid =>
        this.httpClient.get(`${environment.apiUrl}${leid}/billing/invoices`).pipe(
          map((d: BillingInvoicesAPIResponse) => {
            return d.invoices.sort((a, b) => (new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime()) ? 1 : -1);
          }),
        ),
      ),
    );

    this.userAppSettings$ = this.legalEntityId$.pipe(
      switchMap(leid => {
        if (leid) {
          return this.fetchUserAppSettings(leid);
        } else {
          // Probably logging out
          // As it stands we do nothing, which is acceptable in practice since in practice only one user will ever use the same device.
          // TODO: Investigate whether we should clear the userAppSettings localStorage object.
        }
      }),
    );

    this.history$ = combineLatest(this.legalEntityId$, this.historyPeriod$).pipe(
      mergeMap(([leid, period]) => {
          return this.httpClient
            .get(`${environment.apiUrl}${leid}/sessions/statistics/groupedbyday?from=${encodeURIComponent(period)}`)
            .pipe(
              map((statisticsResponse: HistoryForMonthAPIResponse) => {
                const result: any = Object.assign({}, statisticsResponse);

                const series: HistoryChartDatum[] = [];
                for (const group of result.perDay) {
                  series.push({ name: group.date, value: group.energy / 1000 });
                }

                result.chartData = series;

                return result as HistoryForMonthGUIModel;
              }),
            );
        },
      ),
    );

    this.currentUserTerms$ = this.localeService.locale$.pipe(
      switchMap(() => this.httpClient.get(`${environment.apiUrl}terms/current`)),
      map((tac: TermsAndConditions) => {
        return tac;
      }),
    );
  }

  public async setToken(token: string) {
    await this.storageService.set(STORAGE_SERVICE_KEY.AUTH_TOKEN, token);
    this.lastVerifiedStatus = VerifyTokenStatus.Unknown;
    this.tokenSubject.next(token);
  }

  public async setLegalEntityId(leid: number | string) {
    await this.storageService.set(STORAGE_SERVICE_KEY.LEGAL_ENTITY_ID, leid);
    this.legalEntityIdSubject.next(leid);
  }

  public async setShowCompactView(showCompactView: boolean): Promise<void> {
    const appSettings: UserAppSettings = await this.setUserAppSettingsIndividualProperty({
      property: USER_APP_SETTINGS_PROPERTY.showCompactView,
      value: showCompactView,
      save: true,
    }).then((data) => {
      return data;
    });

    this.compactViewChangedSubject.next(showCompactView);
    this.userAppSettingsSubject$.next(appSettings);
  }

  public async setCompactViewLimit(compactViewLimit: number): Promise<void> {
    const appSettings = await this.setUserAppSettingsIndividualProperty({
      property: USER_APP_SETTINGS_PROPERTY.compactViewLimit,
      value: compactViewLimit,
      save: true,
    });

    this.compactViewLimitChangedSubject.next(compactViewLimit);
    this.userAppSettingsSubject$.next(appSettings);
  }

  public async setShowCarHeatingView(chargeOptionsView: boolean): Promise<void> {
    const appSettings = await this.setUserAppSettingsIndividualProperty({
      property: USER_APP_SETTINGS_PROPERTY.showCarHeating,
      value: chargeOptionsView,
      save: true,
    });
    this.compactViewChangedSubject.next(chargeOptionsView);
    this.userAppSettingsSubject$.next(appSettings);

  }

  public async setAdvancedView(advanced: boolean): Promise<void> {
    await this.storageService.set(STORAGE_SERVICE_KEY.ADVANCED, advanced);
    this.advancedViewChangedSubject.next(advanced);
  }

  public async setBeta(beta: boolean): Promise<void> {
    await this.storageService.set(STORAGE_SERVICE_KEY.BETA, beta);
    this.betaChangedSubject.next(beta);
  }

  public async setUserAppSettings(params: {
    appSettings: UserAppSettings,
    migrate?: boolean, save?: boolean,
    isFirstSave?: boolean
  }): Promise<void> {
    if (params.migrate) {
      const alreadyMigrated = await this.storageService.get(STORAGE_SERVICE_KEY.MIGRATED_TO_USER_APP_SETTINGS);
      if (!alreadyMigrated) {
        await migrateDisparateSettingsToAppSettings(params.appSettings, this.storageService);
        await this.storageService.set(STORAGE_SERVICE_KEY.MIGRATED_TO_USER_APP_SETTINGS, true);
      }
    }
    await this.storageService.set(STORAGE_SERVICE_KEY.USER_APP_SETTINGS, params.appSettings);
    if (params.save) {
      this.saveUserAppSettings(params).subscribe((saveSettingsSaved) => {
        // We re-calculate upon every save in case the user does not go back to the charge page tab. This way, if the user logs in using
        // another session we still have the proper settings.
        this.calculateShouldUseCompactView({ userAppSettings: saveSettingsSaved });
      });
    }
    this.userAppSettingsSubject$.next(params.appSettings);
  }

  private async setUserAppSettingsIndividualProperty(params: {
    property: string,
    value: (boolean | number),
    save?: boolean
  }): Promise<UserAppSettings> {
    const appSettings: UserAppSettings = await this.storageService.get(STORAGE_SERVICE_KEY.USER_APP_SETTINGS);
    if (!appSettings || !params.property) {
      return appSettings;
    }
    appSettings[params.property] = params.value;
    if (params.property === USER_APP_SETTINGS_PROPERTY.showCompactView) {
      if (!appSettings[USER_APP_SETTINGS_PROPERTY.hasSetCompactView]) {
        appSettings[USER_APP_SETTINGS_PROPERTY.hasSetCompactView] = true;
      }
    }

    await this.setUserAppSettings({ appSettings, save: params.save });
    const returnPromise = Promise.resolve(appSettings);
    return returnPromise;
  }

  public logout(): void {
    from(this.storageService.remove(STORAGE_SERVICE_KEY.AUTH_TOKEN)).subscribe();
    from(this.storageService.remove(STORAGE_SERVICE_KEY.LEGAL_ENTITY_ID)).subscribe();
    this.tokenSubject.next(null);
    this.legalEntityIdSubject.next(null);
  }

  public login(email: string, password: string): Observable<LoginResult> {
    const url = `${environment.apiUrl}app/authenticate/login`;
    return this.httpClient.post(url, { email, password })
      .pipe(
        map(response => response as any),
        tap(async response => {
          if (response.result === API.GENERIC_RESULT.OK) {
            await this.storageService.set(STORAGE_SERVICE_KEY.AUTH_TOKEN, response.token);
            await this.storageService.set(STORAGE_SERVICE_KEY.LEGAL_ENTITY_ID, response.legalEntityId);
            this.tokenSubject.next(response.token);
            this.legalEntityIdSubject.next(response.legalEntityId);
            this.lastVerifiedStatus = VerifyTokenStatus.Success;
            // this.verifyTokenStatus$.subscribe(() => {
            // });
          } else {
            this.legalEntityIdSubject.next(null);
            this.lastVerifiedStatus = VerifyTokenStatus.InvalidToken;
          }
        }),
        map(response => {
          if (response.result === API.GENERIC_RESULT.OK) {
            return LoginResult.Success;
          } else {
            return LoginResult.InvalidCredentials;
          }
        }),
        tap(result => {
          if (result === LoginResult.Success) {
            // Update server side locale
            this.localeService.locale$.pipe(
              mergeMap(locale => {
                return this.setPreferredLocale(locale);
              }),
            ).subscribe();
          }
        }),
      );
  }

  public resetPassword(email: string): Observable<ResetPasswordResult> {
    return this.httpClient.post(`${environment.apiUrl}app/authenticate/resetpassword`, { email })
      .pipe(
        map(response => response as any),
        map(response => ResetPasswordResult.Success),
        catchError((err: HttpErrorResponse, r: any) => of(ResetPasswordResult.NotFound)),
      );
  }

  public setPassword(currentPassword: string, newPassword: string): Observable<SetPasswordResult> {
    return this.legalEntityId$.pipe(
      first(),
      mergeMap(leid => this.httpClient.post(`${environment.apiUrl}${leid}/authenticate/setpassword`, { currentPassword, newPassword })),
      map(() => SetPasswordResult.Success),
      catchError((err: HttpErrorResponse, r: any) => {
        if (err.status === HTTP_STATUS_CODE.BadRequest) {
          if (err.error.currentPassword !== API.GENERIC_RESULT.OK) {
            return of(SetPasswordResult.NotMatching);
          }

          if (err.error.newPassword !== API.GENERIC_RESULT.OK) {
            return of(SetPasswordResult.Invalid);
          }
        }

        return of(SetPasswordResult.UnknownError);
      }),
    );
  }

  public startCharge(params: ChargeSessionStartParams): Observable<StartChargeResult> {
    if (!params || !params.legalEntityId || !params.contractUserId || !params.stationId) {
      const errorText = 'user.service -> startCharge: Lacking required params.';
      console.error(errorText, '\nparams: ', params);
      throw Error(errorText);
    }

    const url = `${environment.apiUrl}${params.legalEntityId}/sessions`;

    const heatingSessionParams = params.otherParams;
    const departureTime = (heatingSessionParams?.time && heatingSessionParams?.date) ? Moment(`${heatingSessionParams.date} ${heatingSessionParams.time}`).format() : null;

    const body: APIBodyChargeSessionStart = {
      contractUserId: params.contractUserId,
      stationId: params.stationId,
      departureTime,
    };

    return this.httpClient.put(url, body).pipe(
      map((d: any) => {
        return d.result === API.GENERIC_RESULT.OK ? StartChargeResult.Success : StartChargeResult.Failed;
      }),
      catchError(() => of(StartChargeResult.Failed)),
    );
  }

  public stopCharge(params: ChargeSessionStopParams): Observable<StopChargeResult> {
    if (!params || !params.legalEntityId || !params.sessionId) {
      const errorText = 'user.service -> stopCharge: Lacking params.';
      console.error(errorText, '\nparams: ', params);
      throw Error(errorText);
    }

    const url = `${environment.apiUrl}${params.legalEntityId}/sessions/${params.sessionId}`;
    return this.httpClient.delete(url).pipe(
      map((d: any) => {
        return d.result === API.GENERIC_RESULT.OK ? StopChargeResult.Success : StopChargeResult.Failed;
      }),
    );
  }

  public setPreferredLocale(locale: ILocale): Observable<any> {
    if (locale == null) {
      return of(false);
    }

    return this.legalEntityId$.pipe(
      first(),
      mergeMap(leid => {
        if (leid > 0) {
          return this.httpClient.post(`${environment.apiUrl}${leid}/settings/locale`, { locale: locale.isoString });
        } else {
          return of(false);
        }
      }),
    );
  }

  public register(email: string, firstname: string, lastname: string, countryCode: string, termsId: number): Observable<RegisterResult> {
    return this.httpClient.put(`${environment.apiUrl}/app/register`, {
      email,
      firstname,
      lastname,
      countryCode,
      termsId,
    })
      .pipe(
        map(_ => RegisterResult.Success),
        catchError((err: HttpErrorResponse) => {
          if (err.status === HTTP_STATUS_CODE.BadRequest) {
            if (err.error.email === 'Existing') {
              return of(RegisterResult.ExistingAccount);
            }
          }

          return of(RegisterResult.UnknownError);
        }),
      );
  }

  public getStatus(): Observable<StatusResultWithMessage> {
    return this.httpClient.get(`https://status.cacharge.com/status.json?rid=${Math.floor(Math.random() * 20000000)}`)
      .pipe(
        map((a: any) => {
          if (a.length > 0) {
            const item = a[0];
            if (item.severity === 'FATAL') {
              return { Status: StatusResult.Fatal, Title: item.title.sv, Message: item.message.sv };
            } else if (item.severity !== 'NONE') {
              return { Status: StatusResult.Information, Title: item.title.sv, Message: item.message.sv };
            }
          }

          return { Status: StatusResult.None, Title: '', Message: '' };
        }),
        catchError(() => {
          return of({ Status: StatusResult.None, Title: '', Message: '' });
        }),
      );
  }

  public async setUser(data: IWebSocketTypeOfUserUpdated): Promise<void> {
    this.userUpdated$.next(data);
  }

  public setHistoryPeriod(date: string) {
    this.historyPeriod$.next(date);
  }

  public createBraintreeToken(): Observable<string> {
    return this.legalEntityId$.pipe(
      first(),
      mergeMap(leid => {
        return this.httpClient.get(`${environment.apiUrl}${leid}/paymentmethods/braintree`);
      }),
      map((r: any) => r.token),
    );
  }

  public addBraintreePaymentMethod(nonce: string): Observable<boolean> {
    return this.legalEntityId$.pipe(
      first(),
      mergeMap(leid => this.httpClient.put(`${environment.apiUrl}${leid}/paymentmethods/braintree`, { nonce })),
      map((r: any) => {
        this.paymentMethodsChangedSubject.next(true);
        return r.result === API.GENERIC_RESULT.OK;
      }),
    );
  }

  public reloadPaymentMethods() {
    this.paymentMethodsChangedSubject.next(true);
  }

  public addContract(zoneId: number, nonce: string): Observable<boolean> {
    return this.legalEntityId$.pipe(
      first(),
      mergeMap(leid => this.httpClient.put(`${environment.apiUrl}app/contracts`, { zoneId, nonce })),
      map((r: any) => {
        this.paymentMethodsChangedSubject.next(true);
        return r.result === API.GENERIC_RESULT.OK;
      }),
    );
  }

  public cancelContract(contractOwnerId: number, contractId: number): Observable<boolean> {
    return this.httpClient.delete(`${environment.apiUrl}${contractOwnerId}/contracts/${contractId}`).pipe(
      map((r: any) => {
        return r.result === API.GENERIC_RESULT.OK;
      }),
    );
  }

  public removeBraintreePaymentMethod(paymentMethodId: number): Observable<boolean> {
    return this.legalEntityId$.pipe(
      first(),
      mergeMap(leid => this.httpClient.delete(`${environment.apiUrl}${leid}/paymentmethods/${paymentMethodId}`)),
      map((r: any) => {
        this.paymentMethodsChangedSubject.next(true);
        return r.result === API.GENERIC_RESULT.OK;
      }),
    );
  }

  public savePaymentMethodSortOrder(paymentMethods: any): Observable<boolean> {
    const request = { paymentMethodIds: [] };

    for (const item of paymentMethods) {
      request.paymentMethodIds.push(item.paymentMethodId);
    }

    return this.legalEntityId$.pipe(
      first(),
      mergeMap(leid => this.httpClient.post(`${environment.apiUrl}${leid}/paymentmethods/sort`, request)),
      map((r: any) => {
        this.paymentMethodsChangedSubject.next(true);
        return r.result === API.GENERIC_RESULT.OK;
      }),
    );
  }

  public getZoneInfo(zoneCode: string): Observable<ZoneInfo> {

    return this.httpClient.get(`${environment.apiUrl}app/zones/info/${zoneCode}`).pipe(
      map((response: GetChargeZoneInfoAPIResponse) => {

        console.info('user.service -> getZoneInfo: ',
          '\nresponse: ', response);
        return { Status: ZoneInfoStatus.Valid, Data: response };
      }),
      catchError((err: HttpErrorResponse, r: any) => {
        if (err.status === HTTP_STATUS_CODE.BadRequest) {
          switch (err.error.zoneCode) {
            case 'ContractExists':
              return of({ Status: ZoneInfoStatus.Existing, Data: err.error });
            case 'PrivateZone':
              return of({ Status: ZoneInfoStatus.Unauthorized, Data: err.error });
            default:
              return of({ Status: ZoneInfoStatus.NotFound, Data: err.error });
          }
        } else {
          return of({ Status: ZoneInfoStatus.NotFound, Data: null });
        }
      }),
    );
  }

  public fetchUserAppSettings(userId: number): Observable<UserAppSettings> {
    if (!userId) {
      throw Error('fetchUserAppSettings: No userId number');
    }
    const url = `${environment.apiUrl}${userId}/appsettings`;

    return this.httpClient.get(url).pipe(
      map((response: UserAppSettingsAPIResponse) => {
        const appSettings = response.data;
        this.setUserAppSettings({ appSettings, migrate: true });
        return response.data;
      }));

  }

  public async getUserAppSettings(): Promise<UserAppSettings> {
    return await this.storageService.get(STORAGE_SERVICE_KEY.USER_APP_SETTINGS);
  }

  public async getShouldUseCompactView(): Promise<boolean> {
    return await this.storageService.get(STORAGE_SERVICE_KEY.SHOULD_USE_COMPACT_VIEW);
  }

  public saveUserAppSettings(params: { appSettings: UserAppSettings, isFirstSave?: boolean }): Observable<UserAppSettings> {
    if (!params || !params.appSettings) {
      throw Error('user.service -> saveUserAppSettings: "params" must be provided and contain appSettings.');
    }
    setDefaultAppSettingsWhereApplicable(params.appSettings);

    return this.legalEntityId$.pipe(
      first(),
      mergeMap(leid => {
        const url = `${environment.apiUrl}${leid}/appsettings`;
        return this.httpClient.post(url, params.appSettings);
      }),
      map((appSettingsUpdateResponse: UserAppSettingsAPIResponse) => {
        return appSettingsUpdateResponse.data;
      })
      ,
      catchError((error) => {
        const errorText = 'user.service -> saveUserAppSettings: Error in saving '
          + '\nerror: ' + error;
        throw (errorText);
      }),
    );
  }

  public acceptTerms(): Observable<boolean> {
    return combineLatest(this.legalEntityId$, this.currentUserTerms$).pipe(
      mergeMap(([leid, terms]) => {
        return this.httpClient.put(
          `${environment.apiUrl}${leid}/terms/accept`, { termsId: terms.termsId }).pipe(
          map((r: any) => {
            return r.success;
          }),
        );
      }),
    );
  }

  public acceptChargeZoneTerms(chargeZone: ChargeZone, termsToAccept): Observable<boolean> {
    if (termsToAccept.contractTermsId) {
      return this.httpClient
        .post(
          `${environment.apiUrl}${chargeZone.contracteeId}/contracts/${chargeZone.contractId}/accept`,
          { contractTermsId: termsToAccept.contractTermsId },
        )
        .pipe(
          map((r: any) => {
            return r.result === API.GENERIC_RESULT.OK;
          }),
        );
    } else {
      return this.httpClient
        .post(
          `${environment.apiUrl}${chargeZone.contracteeId}/contracts/${chargeZone.contractId}/users/${chargeZone.newTerms.contractUserId}/accept`,
          { contractUserTermsId: termsToAccept.contractUserTermsId },
        )
        .pipe(
          map((r: any) => {
            return r.result === API.GENERIC_RESULT.OK;
          }),
        );
    }
  }

  public async calculateShouldUseCompactView(params: {
    userAppSettings?: UserAppSettings,
    stationsObject?: StationsAvailableObject
  }): Promise<boolean> {
    let shouldUseCompactView = false;
    let userAppSettings = params.userAppSettings;
    if (!userAppSettings) {
      userAppSettings = await this.getUserAppSettings();
    }
    const stationsObject = params.stationsObject || cache.stationsObject;

    if (!userAppSettings || !userAppSettings.showCompactView) {
      return shouldUseCompactView;
    }
    const allStationsCount = (stationsObject && stationsObject.allStations)
      ? Object.keys(stationsObject.allStations).length
      : null;

    if (!allStationsCount) {
      return shouldUseCompactView;
    }
    const totalStationsAreMoreThanCompactViewLimit = (allStationsCount > userAppSettings.compactViewLimit);
    shouldUseCompactView = totalStationsAreMoreThanCompactViewLimit;
    return shouldUseCompactView;
  }

  public async setShouldUseCompactView(shouldUseCompactView: boolean): Promise<boolean> {
    await this.storageService.set(STORAGE_SERVICE_KEY.SHOULD_USE_COMPACT_VIEW, shouldUseCompactView).then(() => {
      this.shouldUseCompactViewSubject$.next(shouldUseCompactView);
      this.shouldUseCompactView$.pipe(
        map(() => {
          return shouldUseCompactView;
        }),
      );
    });

    return new Promise((resolve) => resolve(shouldUseCompactView));
  }

}
