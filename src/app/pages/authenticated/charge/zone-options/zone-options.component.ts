import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { tap } from 'rxjs/operators';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService } from 'src/app/services/user.service';
import { ChargeZone } from '../../../../models/chargeZone';
import { DecimalPipe } from '@angular/common';

function formatTo2DecimalPlaces(params: { decimalPipe: DecimalPipe, value: number }): number {
  if (!params?.decimalPipe) {
    const errorText = 'Function "setTo2DecimalPlaces" requires an object with"decimalPipe" and "value" properties.';
    console.error(errorText, '\nIt is currently:\n', params);
    throw Error(errorText);
  }
  const decimalString = (params.value > 0) ? params.decimalPipe.transform(params.value, '1.0-2') : `${params.value}`;
  const numberToReturn = parseFloat(decimalString);
  return numberToReturn;
}

@Component({
  selector: 'app-zone-options',
  templateUrl: './zone-options.component.html',
  styleUrls: ['./zone-options.component.scss'],
})
export class ZoneOptionsComponent implements OnInit {
  @Input()
  public chargeZone: ChargeZone;

  @Output()
  public cancelled = new EventEmitter();

  public t: ITranslator;

  constructor(
    private loadingController: LoadingController,
    private userService: UserService,
    private alertController: AlertController,
    translatorFactoryService: TranslatorFactoryService,
    private decimalPipe: DecimalPipe,
  ) {
    this.t = translatorFactoryService.create('pages.authenticated.charge.components.zone-options');
  }

  ngOnInit() {
     this.setFeesTo2DecimalPlaces();
  }

  public async cancelContract(chargeZone: any): Promise<void> {
    const alert = await this.alertController.create({
      header: this.t('cancel.title'),
      message: this.t('cancel.message'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.t('cancel.cancel'),
          handler: () => {
          },
        }, {
          text: this.t('cancel.confirm'),
          handler: () => {
            this.internalCancelContract(chargeZone);
          },
        },
      ],
    });
    alert.present();
  }

  private async internalCancelContract(chargeZone: ChargeZone): Promise<void> {
    const loading = await this.loadingController.create({message: this.t('cancel.cancelling')});
    await loading.present();

    this.userService.cancelContract(chargeZone.contracteeId, chargeZone.contractId).pipe(
      tap(async _ => {
        this.cancelled.emit();
        await loading.dismiss();
      }),
    ).subscribe();
  }

  private setFeesTo2DecimalPlaces() {
    if (!this.chargeZone?.terms) {
      return;
    }
    const terms = this.chargeZone.terms;

    let termsFee = terms.consumptionFee;
    if (termsFee) {
      termsFee.value = formatTo2DecimalPlaces({value: termsFee.value, decimalPipe: this.decimalPipe});
    }

    termsFee = terms.subscriptionFee;
    if (termsFee) {
      termsFee.value = formatTo2DecimalPlaces({value: termsFee.value, decimalPipe: this.decimalPipe});
    }

  }

}
