import { Component, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { ZoneAddComponent } from '../zone-add/zone-add.component';
import { NgForm } from '@angular/forms';


import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService, ZoneInfoStatus } from 'src/app/services/user.service';
import { DeviceService } from 'src/app/services/device.service';
import { combineLatest } from 'rxjs';
import { LocaleService } from 'src/app/services/locale.service';
import { first, tap } from 'rxjs/operators';

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { environment, vendor } from 'src/environments/environment';

@Component({
  selector: 'app-zone-search',
  templateUrl: './zone-search.component.html',
  styleUrls: ['./zone-search.component.scss'],
})
export class ZoneSearchComponent {
  public t: ITranslator;

  @Output()
  public closed = new EventEmitter();

  @Input()
  public showClose = false;

  public vendor = vendor;
  constructor(
    translatorFactoryService: TranslatorFactoryService,
    private userService: UserService,
    private modalController: ModalController,
    private toastController: ToastController,
    private deviceService: DeviceService,
    private loadingController: LoadingController,
    private localeService: LocaleService,
    private inAppBrowser: InAppBrowser,
    private cdr: ChangeDetectorRef,
  ) {
    this.t = translatorFactoryService.create('pages.authenticated.charge.components.zone-search');
  }

  public async search(form: NgForm): Promise<void> {
    this.userService.getZoneInfo(form.value.zoneCode).subscribe(async result => {
      switch (result.Status) {
        case ZoneInfoStatus.Valid:
          if (await this.deviceService.isRunningOnDevice() && !this.deviceService.isSSL()) {
            const loading = await this.loadingController.create();
            await loading.present();

            combineLatest([this.localeService.locale$, this.userService.token$]).pipe(
              first(),
              tap(([locale, token]) => {
                const language = locale?.language ?? 'en';
                const uri = `${environment.appUrl}/authenticated/charge/zone-add/${form.value.zoneCode}?token=${token}&locale=${language}`;
                const browser = this.inAppBrowser.create(uri, '_blank', {
                  hidenavigationbuttons: 'yes',
                  hidden: 'yes',
                  location: 'no',
                });
                browser.on('loadstop').subscribe(async () => {
                  browser.show();
                });
                browser.on('message').pipe(first()).subscribe(() => {
                  browser.close();
                });
                browser.on('exit').pipe(first()).subscribe(async () => {
                  this.cdr.detectChanges();
                  await loading.dismiss();
                });
              }),
            ).subscribe();
          } else {
            console.log(result.Data);
            const modal = await this.modalController.create({
              component: ZoneAddComponent,
              componentProps: { data: result.Data, inModal: true },
            });
            await modal.present();
            this.closed.emit();
          }
          break;

        case ZoneInfoStatus.Unauthorized:
        case ZoneInfoStatus.Existing:
        case ZoneInfoStatus.NotFound:
          const toast = await this.toastController.create({
            message: this.t('error.' + result.Status),
            // showCloseButton: false,
            position: 'top',
            cssClass: 'danger',
            duration: 2000,
          });
          await toast.present();
      }
    });
  }
}
