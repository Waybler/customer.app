import { ChangeDetectorRef, Component } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { AddPaymentMethodComponent } from './add-payment-method/add-payment-method.component';

import { environment } from 'src/environments/environment';
import { first, mergeMap, tap } from 'rxjs/operators';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService } from 'src/app/services/user.service';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { ActivatedRoute } from '@angular/router';
import { LocaleService } from 'src/app/services/locale.service';
import { combineLatest } from 'rxjs';
import { DeviceService } from 'src/app/services/device.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-economy',
  templateUrl: './economy.page.html',
  styleUrls: ['./economy.page.scss'],
})
export class EconomyPage {
  public sorting = false;
  private sortedPaymentMethods: any;

  public t: ITranslator;

  public show: any = {};

  private delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  constructor(public userService: UserService, private modalController: ModalController, private loadingController: LoadingController,
              private transfer: FileTransfer,
              private fileOpener: FileOpener,
              public activatedRoute: ActivatedRoute,
              translatorFactoryService: TranslatorFactoryService,
              private localeService: LocaleService,
              private deviceService: DeviceService,
              private inAppBrowser: InAppBrowser,
              private cdr: ChangeDetectorRef
  ) {
    this.t = translatorFactoryService.create('pages.authenticated.economy');
  }

  public async addPaymentMethod(): Promise<void> {
    if (await this.deviceService.isRunningOnDevice() && !this.deviceService.isSSL()) {
      const loading = await this.loadingController.create();
      await loading.present();

      combineLatest([this.localeService.locale$, this.userService.token$]).pipe(
        first(),
        tap(([locale, token]) => {
          const language = locale?.language ?? 'en';
          const uri = `${environment.appUrl}/authenticated/economy/add-payment-method?token=${token}&locale=${language}`;
          const browser = this.inAppBrowser.create(uri, '_blank', {
            hidenavigationbuttons: 'yes',
            hidden: 'yes',
            location: 'no',
            footer: 'no'
          });
          browser.on('loadstop').pipe(first()).subscribe(async m => {
            browser.show();
          });
          browser.on('message').pipe(first()).subscribe(m => {
            if (m.data.event === 'close' && m.data.success) {
              this.userService.reloadPaymentMethods();
            }
            browser.close();
          });
          browser.on('exit').pipe(first()).subscribe(async () => {
            this.cdr.detectChanges();
            await loading.dismiss();
          });
        })
      ).subscribe();
    } else {
      const modal = await this.modalController.create({
        component: AddPaymentMethodComponent,
      });
      await modal.present();
    }
  }

  public async removePaymentMethod(paymentMethod: any): Promise<void> {
    const loading = await this.loadingController.create({message: this.t('payment-methods.removing')});
    await loading.present();
    this.userService.removeBraintreePaymentMethod(paymentMethod.paymentMethodId).subscribe(() => {
      loading.dismiss();
      this.show[paymentMethod.paymentMethodId] = null;
    });
  }

  public reorderItems(paymentMethods, event): void {
    this.array_move(paymentMethods, event.detail.from, event.detail.to);
    this.sortedPaymentMethods = paymentMethods;
    event.detail.complete();
  }

  private array_move(arr, oldIndex, newIndex): void {
    if (newIndex >= arr.length) {
      let k = newIndex - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
  }

  public async saveSorting(): Promise<void> {
    const loading = await this.loadingController.create({message: this.t('payment-methods.saving')});
    await loading.present();
    this.userService.savePaymentMethodSortOrder(this.sortedPaymentMethods).subscribe(() => {
      loading.dismiss();
      this.sorting = false;
    });
  }

  public async downloadInvoice(invoice: any): Promise<void> {
    combineLatest([this.userService.token$, this.userService.legalEntityId$]).pipe(
      first(),
      mergeMap(async ([token, leid]) => {
        if (await this.deviceService.isRunningOnDevice()) {
          const uri = `${environment.apiUrl}${leid}/billing/invoices/${invoice.invoiceId}?token=${token}&download=true`;
          const loading = await this.loadingController.create({message: this.t('invoices.downloading')});
          await loading.present();

          const path = `${new File().dataDirectory}/cacharge-${invoice.invoiceId}.pdf`;
          const fileTransfer: FileTransferObject = this.transfer.create();
          fileTransfer.download(
            uri,
            path
          ).then(a => {
            this.fileOpener.open(path, 'application/pdf')
              .then(() => {
                loading.dismiss();
              })
              .catch(async () => {
                loading.message = this.t('invoices.could-not-open');
                await this.delay(1000);
                await loading.dismiss();
              });
          }).catch(async error => {
            loading.message = this.t('invoices.unknown-error');
            await this.delay(1000);
            await loading.dismiss();
          });
        } else {
          const uri = `${environment.apiUrl}${leid}/billing/invoices/${invoice.invoiceId}?token=${token}`;
          window.open(uri, '_system');
        }
      })
    ).subscribe();
  }
}
