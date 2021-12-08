import { AfterViewInit, Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController, LoadingController, AlertController, ToastController } from '@ionic/angular';
import { map, catchError } from 'rxjs/operators';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService, RegisterResult } from 'src/app/services/user.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, AfterViewInit {
    public termsId: number | null;
    public t: ITranslator;

    private delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    @ViewChild('form') ngForm: NgForm;

    constructor(
        private modalController: ModalController,
        private userService: UserService,
        private loadingController: LoadingController,
        private alertController: AlertController,
        private toastController: ToastController,
        translateProviderFactory: TranslatorFactoryService
    ) {
        this.t = translateProviderFactory.create('pages.unauthenticated.login.components.register');
    }
    
    ngOnInit() {
        this.userService.currentUserTerms$.subscribe(
            data => this.termsId = data.termsId,
            error => {
                this.toastController.create({ cssClass: 'danger', message: this.t('unknown-error'), duration: 2000 })
                    .then(t => t.present());
                this.closeModal(null);
            });
    }

    
    ngAfterViewInit(): void {
        setTimeout(() => {
            this.ngForm.setValue({
                firstname: "",
                lastname: "",
                email: "",
                countryCode: "SE"
            });    
        }, 1);
    }

    public async closeModal(data?: any): Promise<void> {
        this.modalController.dismiss(data);
    }

    public async register(form: any): Promise<void> {
        const loadingElement = await this.loadingController.create({
            message: this.t('registrating')
        });
        await loadingElement.present();

        this.userService.register(form.value.email, form.value.firstname, form.value.lastname, form.value.countryCode, this.termsId)
            .pipe(
                map(async r => {
                    switch (r) {
                        case RegisterResult.Success:
                            await loadingElement.dismiss();
                            this.closeModal(form.value.email);

                            const alert = await this.alertController.create({
                                header: this.t('success.title'),
                                message: this.t('success.message', form.value),
                                buttons: [this.t('success.ok')]
                            });

                            await alert.present();
                            break;

                        case RegisterResult.ExistingAccount:
                            this.closeModal(form.value.email);
                            loadingElement.spinner = null;
                            loadingElement.message = this.t('existing');
                            await this.delay(1000);
                            await loadingElement.dismiss();
                            break;

                        case RegisterResult.UnknownError:
                            loadingElement.spinner = null;
                            loadingElement.message = this.t('unknown-error');
                            await this.delay(1000);
                            await loadingElement.dismiss();
                            break;
                    }
                }),
                catchError(async () => await loadingElement.dismiss())
            ).subscribe();
    }
}
