import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { take, tap, finalize, first } from 'rxjs/operators';
import { NavController, ToastController, LoadingController, AlertController} from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { ICodePushPackage, CodePushService } from 'src/app/services/code-push.service';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService, SetPasswordResult } from 'src/app/services/user.service';
import { DeviceService } from 'src/app/services/device.service';
import { LocaleService } from 'src/app/services/locale.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class SettingsPage implements OnInit {
  public t: ITranslator;

  public compactView: boolean;
  public chargeOptionsView: boolean;

  public beta: boolean;
  public advancedCount = 0;
  public binaryVersion: string = null;
  public localPackage: ICodePushPackage = null;
  private advancedTimer: any;

  constructor(
    translatorFactoryService: TranslatorFactoryService,
    public userService: UserService,
    public codePush: CodePushService,
    private navController: NavController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private deviceService: DeviceService,
    public localeService: LocaleService,
  ) {
    this.t = translatorFactoryService.create('pages.authenticated.settings');
  }

  public async ngOnInit(): Promise<void> {
    this.userService.compactView$.pipe(
      take(1),
      tap(v => {
        this.compactView = v;
      }),
    ).subscribe();

    this.userService.chargeOptionsView$.pipe(
      take(1),
      tap(v => {
        this.chargeOptionsView = v;
      }),
    ).subscribe();

    this.userService.beta$.pipe(
      take(1),
      tap(v => {
        this.beta = v;
      }),
    ).subscribe();

    this.binaryVersion = await this.deviceService.getVersionNumber();
    if (await this.deviceService.isRunningOnDevice()) {
      this.codePush.codePushVersion$.pipe(
        first(),
        tap(v => {
          this.localPackage = v;
        }),
      ).subscribe();
    }
  }

  public logout(): void {
    this.userService.logout();
    this.navController.navigateRoot('/unauthenticated');
  }

  public setShowCompactView(event): void {
    this.userService.setShowCompactView(event.detail.checked);
  }

  public setCompactViewLimit(event): void {
    this.userService.setCompactViewLimit(event.detail.value);
  }

  public setShowCarHeatingView(event): void {
    this.userService.setShowCarHeatingView(event.detail.checked);
  }

  public setBeta(event): void {
    this.userService.setBeta(event.detail.checked);
  }

  public async enableAdvancedView(): Promise<void> {
    clearTimeout(this.advancedTimer);
    this.advancedTimer = setTimeout(() => {
      this.advancedCount = 0;
    }, 1000);
    this.advancedCount = this.advancedCount + 1;
    if (this.advancedCount === 5) {
      await this.userService.setAdvancedView(true);
      const toast = await this.toastController.create({message: this.t('advanced.enabled'), duration: 2000});
      toast.present();
    } else if (this.advancedCount > 2) {
      const toast = await this.toastController.create(
        {message: this.t('advanced.clicks', {left: (5 - this.advancedCount)}), duration: 500},
      );
      toast.present();
    }
  }

  public async setPassword(form: NgForm): Promise<void> {
    const loading = await this.loadingController.create({message: this.t('password.setting')});
    await loading.present();

    this.userService.setPassword(form.value.currentPassword, form.value.newPassword).pipe(
      tap(v => {
        if (v === SetPasswordResult.Success) {
          this.toastController.create({message: this.t('password.setted'), duration: 2000}).then(t => t.present());
          this.logout();
          return;
        }

        let header = '';
        let message = '';
        switch (v) {
          case SetPasswordResult.Invalid:
            header = this.t('password.invalid.header');
            message = this.t('password.invalid.message');
            break;
          case SetPasswordResult.NotMatching:
            header = this.t('password.not-matching.header');
            message = this.t('password.not-matching.message');
            break;
          case SetPasswordResult.UnknownError:
            header = this.t('password.unknown-error.header');
            message = this.t('password.unknown-error.message');
            break;
        }

        this.alertController.create({
          header,
          message,
          buttons: [this.t('password.ok')],
        }).then(a => a.present());
      }),
      finalize(() => {
        loading.dismiss();
      }),
    ).subscribe();
  }
}
