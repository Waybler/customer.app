import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { take, tap, first, map } from 'rxjs/operators';

import { vendor } from 'src/environments/environment';
import { CodePushService } from '../../services/code-push.service';
import { LocaleService } from '../../services/locale.service';
import { ITranslator, TranslatorFactoryService } from '../../services/translator-factory.service';
import { StatusResult, StatusResultWithMessage, UserService, VerifyTokenStatus } from '../../services/user.service';

interface SelectScreenParams {
  retry: boolean;
}

@Component({
  selector: 'app-start',
  templateUrl: 'start.page.html',
  styleUrls: ['start.page.scss'],
})
export class StartPage implements OnInit {

  public t: ITranslator;

  public selectingLanguage = false;

  constructor(
    translateProviderFactory: TranslatorFactoryService,
    private userService: UserService,
    private alertController: AlertController,
    private navController: NavController,
    private localeService: LocaleService) {
    this.t = translateProviderFactory.create('pages.start');
  }

  public ngOnInit() {
    setTimeout(async () => {
      this.localeService.hasLocale$.pipe(
        take(1),
        tap(haveLocale => {
          if (haveLocale) {
            this.getStatus();
          } else {
            this.selectingLanguage = true;
          }
        }),
      ).subscribe();
    }, 100);
  }

  public localeSelected(): void {
    this.getStatus();
  }

  private getStatus(): void {
    this.userService.getStatus().subscribe(result => {
      switch (result.Status) {
        case StatusResult.None: {
          this.selectScreen();
          break;
        }

        case StatusResult.Information: {
          this.showInformation(result);
          break;
        }

        case StatusResult.Fatal: {

          this.alertController.create({
            header: result.Title,
            message: result.Message,
            backdropDismiss: false,
            buttons: [{
              text: this.t('try-again'),
              handler: () => {
                this.getStatus();
              },
            }],
          }).then(alert => alert.present());
          break;
        }
      }
    });
  }

  private selectScreen(params?: SelectScreenParams): void {
    this.userService.verifyTokenStatus$.pipe(
      first(),
      map(result => {
        if (result === VerifyTokenStatus.Success) {
          this.navController.navigateRoot('/authenticated');
        } else if (result === VerifyTokenStatus.InvalidToken || result === VerifyTokenStatus.NoToken) {
          this.navController.navigateForward('/unauthenticated');
        } else {
          const buttons = [];

          buttons.push({
            text: this.t('try-again'),
            handler: () => {
              this.selectScreen({
                retry: true,
              });
            },
          });
          if (params?.retry) {
            if (this.alertController) {
              this.alertController.dismiss().then((dret) => {
                if (window?.location?.reload) {
                  window.location.reload();
                }
              });
            }
          } else {
            this.alertController.create({
              header: this.t('error.title'),
            message: this.t('error.message', { vendorName: vendor.vendorName }),
              backdropDismiss: false,
              buttons,
            }).then(alert => {
              alert.present();
            });
          }
        }
      }),
    ).subscribe();
  }

  private async showInformation(r: StatusResultWithMessage) {
    const alert = await this.alertController.create({
      header: r.Title,
      message: r.Message,
      buttons: [{
        text: this.t('ok'),
        handler: () => {
          this.selectScreen();
        },
      }],
    });
    await alert.present();
  }
}
