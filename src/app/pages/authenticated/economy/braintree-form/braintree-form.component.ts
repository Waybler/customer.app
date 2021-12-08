import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ApplicationRef } from '@angular/core';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService } from 'src/app/services/user.service';

import { Client, HostedFields, HostedFieldsStateObject, ThreeDSecure } from 'braintree-web';
import * as braintree from 'braintree-web';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-braintree-form',
  templateUrl: './braintree-form.component.html',
  styleUrls: ['./braintree-form.component.scss'],
})
export class BraintreeFormComponent implements OnInit {
  public ready: boolean;
  public isLoading: boolean;

  private hostedFieldsInstance: HostedFields = null;
  private braintreeInstance: Client = null;
  private threeDSecureInstance: ThreeDSecure = null;

  public t: ITranslator;

  @ViewChild('form')
  form: any;

  @Output()
  requestingNonce = new EventEmitter();

  @Output()
  loading = new EventEmitter<boolean>();

  @Output()
  error = new EventEmitter<string>();

  @Output()
  success = new EventEmitter();

  public fields: any = {
    number: { showError: false },
    cvv: { showError: false },
    expirationDate: { showError: false },
    postalCode: { showError: false },
  };

  private delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  constructor(
    private userService: UserService,
    private applicationRef: ApplicationRef,
    private loadingController: LoadingController,
    translatorFactoryService: TranslatorFactoryService,
  ) {
    this.t = translatorFactoryService.create('pages.authenticated.economy.components.braintree-form');
  }

  public ngOnInit(): void {
    this.intializeBraintree();
  }

  private intializeBraintree(): void {
    try {
      this.userService.createBraintreeToken().subscribe(
        async token => {
          this.braintreeInstance = await braintree.client.create({ authorization: token });
          this.threeDSecureInstance = await braintree.threeDSecure.create({
            version: 2,
            client: this.braintreeInstance,
          });

          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const minWidth1200px = window.matchMedia('(min-width: 1200px)').matches;
          const navigatorUserAgent = navigator.userAgent;
          const navigatorUserAgentIncludesChrome = navigatorUserAgent.includes('Chrome');
          const isDarkAndIsChrome = isDark && navigatorUserAgentIncludesChrome;

          const styles = {
            'font-size': '16px',
            'font-family': '\'Roboto, \'Helvetica Neue\', sans-serif\'',
            outline: 'none',
            // background: isDark ? '#1e1e1e' : '#ffffff', // No effect as of now
            color: isDark
              ? ((isDarkAndIsChrome) ? '#1e1e1e' : '#ffffff')
              : 'inherit',
          };

          this.hostedFieldsInstance = await braintree.hostedFields.create({
            client: this.braintreeInstance,
            fields: {
              number: { selector: '#number', placeholder: this.t('number.placeholder') },
              expirationDate: { selector: '#expiration-date', placeholder: this.t('expiration-date.placeholder') },
              postalCode: { selector: '#postal-code', placeholder: this.t('postal-code.placeholder') },
              cvv: { selector: '#cvv', placeholder: this.t('cvv.placeholder') },
            },
            styles: {
              input: styles,
            },
          });

          this.hostedFieldsInstance.on('validityChange', e => this.updateField(e));
          this.hostedFieldsInstance.on('blur', e => this.updateField(e));
          this.hostedFieldsInstance.on('focus', e => this.updateField(e));
          this.hostedFieldsInstance.on('empty', e => this.updateField(e));
          this.hostedFieldsInstance.on('notEmpty', e => this.updateField(e));

          this.ready = true;
        },
      );
    } catch (err) {
      this.onError(err);
      this.applicationRef.tick();
    }
  }

  public updateField(e: any): void {
    const field = e.fields[e.emittedBy];
    const o = this.fields[e.emittedBy];
    o.isValid = field.isValid;
    o.showError = ((!field.isValid && !field.isFocused) || !field.isPotentiallyValid);
    this.applicationRef.tick();
  }

  public cancelVerify(): void {
    this.setIsLoading(false);
  }

  public async addCard(): Promise<void> {
    const ref = this;

    try {
      ref.setIsLoading(true);
      const tokenizeResult = await ref.hostedFieldsInstance.tokenize();

      const verifyCardResult = await ref.threeDSecureInstance.verifyCard({
        amount: 1,
        nonce: tokenizeResult.nonce,
        onLookupComplete(data, next) {
          next();
        },
      } as any, async (err: any, response) => {
        if (err) {
          ref.onError({ name: err.code, message: err.message });
        } else {
          await ref.nonceReceived(response.nonce);
          await ref.delay(100);
          ref.setIsLoading(false);
        }
      });
    } catch (err) {
      console.log(err);
      ref.onError(err);
    }
  }

  public isValid(): boolean {
    if (!this.ready) {
      return false;
    }

    for (const key of Object.keys(this.fields)) {
      const field = this.fields[key];
      if (field.isValid == null || !field.isValid) {
        return false;
      }
    }

    return true;
  }

  private async nonceReceived(nonce: string): Promise<void> {
    const loading = await this.loadingController.create({ message: this.t('adding') });
    await loading.present();
    this.userService.addBraintreePaymentMethod(nonce).subscribe(async r => {
      if (r) {
        loading.dismiss();
        this.success.emit();
      } else {
        loading.message = this.t('failed-to-add');
        this.intializeBraintree();
        await this.delay(1000);
        await loading.dismiss();
      }
    });
  }

  private async onError(err: Error): Promise<void> {
    this.setIsLoading(false);

    const loading = await this.loadingController.create({ message: this.t('failed-to-add'), duration: 1000 });
    await loading.present();

    this.applicationRef.tick();
  }

  private setIsLoading(isLoading: boolean): void {
    this.isLoading = isLoading;
    this.loading.emit(this.isLoading);
  }

  // Braintree test credit card numbers - https://docs-prod-us-east-2.production.braintree-api.com/guides/credit-cards/testing-go-live/java
}
