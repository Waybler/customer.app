import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-zone-add',
  templateUrl: './zone-add.component.html',
  styleUrls: ['./zone-add.component.scss'],
})
export class ZoneAddComponent {
  public isLoading: boolean;

  @Input() inModal: boolean;
  @Input() data: any;
  @Output() close = new EventEmitter();

  public t: ITranslator;

  private delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  constructor(private modalController: ModalController,
              private userService: UserService,
              private loadingController: LoadingController,
              translatorFactoryService: TranslatorFactoryService) {
    this.t = translatorFactoryService.create('pages.authenticated.charge.components.zone-add');
  }

  public loadingChanged(isLoading: boolean): void {
    this.isLoading = isLoading;
  }

  public async addContract(nonce?: string): Promise<void> {
    const loading = await this.loadingController.create({message: this.t('adding')});
    await loading.present();
    this.userService.addContract(this.data.zone.zoneId, nonce).subscribe(
      async r => {
        if (r) {
          loading.dismiss();
          this.closeModal();
        } else {
          loading.message = this.t('failed-to-add');
          await this.delay(1000);
          await loading.dismiss();
        }
      },
    );
  }

  public closeModal(): void {
    if (this.inModal) {
      this.modalController.dismiss();
    }
    this.close.emit();
  }
}
