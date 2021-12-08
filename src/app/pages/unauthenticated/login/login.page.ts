import { Component } from '@angular/core';
import { LoadingController, NavController, ModalController } from '@ionic/angular';
import { catchError, map } from 'rxjs/operators';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NgForm } from '@angular/forms';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService, LoginResult } from 'src/app/services/user.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage {
    public t: ITranslator;

    private delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    constructor(
        private userService: UserService,
        private loadingController: LoadingController,
        private navController: NavController,
        private modalController: ModalController,
        translateProviderFactory: TranslatorFactoryService,
    ) {
        this.t = translateProviderFactory.create('pages.unauthenticated.login');
    }

    public async login(form: any): Promise<void> {
        const loadingElement = await this.loadingController.create({
            message: this.t('logging-in')
        });
        await loadingElement.present();

        this.userService.login(form.value.email, form.value.password)
            .pipe(
                map(async r => {
                    switch (r) {
                        case LoginResult.Success:
                            await loadingElement.dismiss();
                            this.navController.navigateRoot('/authenticated');
                            break;

                        case LoginResult.InvalidCredentials:
                            loadingElement.spinner = null;
                            loadingElement.message = this.t('login-failed');
                            await this.delay(1000);
                            await loadingElement.dismiss();
                            break;
                    }
                }),
                catchError(async e => {
                    await loadingElement.dismiss();
                })
            ).subscribe();
    }

    public async register(form: NgForm): Promise<void> {
        const modal = await this.modalController.create({ component: RegisterComponent });
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if (data) {
            form.control.patchValue({ 'email': data });
        }
    }

    public async reset(form: NgForm): Promise<void> {
        const modal = await this.modalController.create({ component: ResetPasswordComponent });
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if (data) {
            form.control.patchValue({ 'email': data });
        }
    }
}
