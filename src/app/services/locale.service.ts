import { Injectable } from '@angular/core';
import { Observable, from, BehaviorSubject, of } from 'rxjs';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from './storage.service';

export interface ILocale {
  language: string;
  localName: string;
  isoString: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocaleService {
  public hasLocale$: Observable<boolean>;

  private localeSubject = new BehaviorSubject(true);
  public locale$: Observable<ILocale>;

  private localeLoadedSubject = new BehaviorSubject(true);
  public localeLoaded$: Observable<boolean> = this.localeLoadedSubject.asObservable();

  public supportedLocales: Array<ILocale> = [
    {language: 'sv', localName: 'Svenska', isoString: 'sv-SE'},
    {language: 'nb', localName: 'Norsk', isoString: 'nb-NO'},
    {language: 'en', localName: 'English', isoString: 'en-GB'},
    {language: 'fr', localName: 'Français', isoString: 'fr-FR'},
  ];

  constructor(
    private storageService: StorageService,
    private translate: TranslateService
  ) {
    this.locale$ = this.localeSubject.pipe(
      // Get from storage
      switchMap(async _ => {
        const locale = await this.storageService.get('locale');
        return this.getLocaleFromLanguage(locale);
      }),
      // Guess by browser language
      map(locale => {
        if (locale != null) {
          return locale;
        } else {
          const browserLanguage = this.getBrowserLanguage();
          return this.getLocaleFromLanguage(browserLanguage);
        }
      })
    );

    this.locale$.pipe(
      tap(locale => {
        const language = locale?.language ?? 'en';
        this.translate.setDefaultLang(language);
        this.translate.currentLoader.getTranslation(language).pipe(tap(x => this.localeLoadedSubject.next(true))).subscribe();
      })
    ).subscribe();

    this.hasLocale$ = this.locale$.pipe(
      map(m => {
        return m != null;
      })
    );
  }

  private getBrowserLanguage(): string {
    const browserLanguage = this.translate.getBrowserLang();
    if (browserLanguage === 'nn') {
      return 'nb';
    }

    return browserLanguage;
  }

  private getLocaleFromLanguage(language: string) {
    for (const item of this.supportedLocales) {
      if (item.language === language) {
        return item;
      }
    }

    return;
  }

  public setLocale(locale: ILocale): void {
    if (locale == null) {
      return;
    }

    from(this.storageService.set('locale', locale.language)).pipe(
      map(() => {
        this.localeSubject.next(true);
      })
    ).subscribe();
  }

  private getLocaleFromIsoString(isoString: string) {
    for (const item of this.supportedLocales) {
      if (item.isoString === isoString) {
        return item;
      }
    }
  }

  public setLocaleFromLanguage(language: string): void {
    const locale = this.getLocaleFromLanguage(language);
    this.setLocale(locale);
  }

  public setLocaleFromIso(isoString: string): void {
    const locale = this.getLocaleFromIsoString(isoString);
    this.setLocale(locale);
  }
}
