import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ILocale, LocaleService } from 'src/app/services/locale.service';
import { UserService } from 'src/app/services/user.service';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';

@Component({
  selector: 'app-locale-selector',
  templateUrl: './locale-selector.component.html',
  styleUrls: ['./locale-selector.component.scss'],
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  public t: ITranslator;

  @Output()
  public selected = new EventEmitter<ILocale>();

  constructor(
    public localeService: LocaleService,
    public userService: UserService,
    translatorFactoryService: TranslatorFactoryService,
  ) {
    this.t = translatorFactoryService.create('pages.authenticated.settings');

  }
    ngOnInit() {
        this.subscription = this.localeService.locale$.pipe(
            tap(locale => {
                if (locale != null) {
                    this.selected.emit(locale);
                }
            })
        ).subscribe();
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public selectLocale(locale: ILocale) {
        this.localeService.setLocale(locale);
        this.userService.setPreferredLocale(locale).subscribe();
    }
}
