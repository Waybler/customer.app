import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, AlertController } from '@ionic/angular';
import { catchError, map } from 'rxjs/operators';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { ResetPasswordResult, UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
    public t: ITranslator;

    private delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    constructor(
        private userService: UserService,
        private modalController: ModalController,
        private loadingController: LoadingController,
        private alertController: AlertController,
        translateProviderFactory: TranslatorFactoryService
    ) {
        this.t = translateProviderFactory.create('pages.unauthenticated.login.components.reset-password');
    }

    ngOnInit() {
    }

    public async closeModal(email: string = null): Promise<void> {
        this.modalController.dismiss(email);
    }

    public async reset(form: any): Promise<void> {
        const loadingElement = await this.loadingController.create({
            message: this.t('resetting')
        });
        await loadingElement.present();

        this.userService.resetPassword(form.value.email)
            .pipe(
                map(async r => {
                    switch (r) {
                        case ResetPasswordResult.Success:
                            await loadingElement.dismiss();
                            this.closeModal(form.value.email);

                            const alert = await this.alertController.create({
                                header: this.t('success.title'),
                                message: this.t('success.message', form.value),
                                buttons: [this.t('success.ok')]
                            });

                            await alert.present();
                            break;

                        case ResetPasswordResult.NotFound:
                            loadingElement.spinner = null;
                            loadingElement.message = this.t('not-found');
                            await this.delay(1000);
                            await loadingElement.dismiss();
                            break;
                    }
                }),
                catchError(async () => await loadingElement.dismiss())
            ).subscribe();
    }
}
