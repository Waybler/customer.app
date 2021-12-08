import { Component, Input, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit {

  @Input()
  message: string;

  @Input()
  header: string;

  @Input()
  acceptButtonText: string;

  @Input()
  declineButtonText: string;

  @Input()
  actionOnAccept: any;

  @Input()
  actionOnDecline: any;

  constructor(public toastController: ToastController) {
  }

  ngOnInit() {
    this.presentToastWithOptions();
  }

  public async dismissToast() {
    const dismissed = await this.toastController.dismiss({
     });
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: this.message,
      duration: 2000,
    });
    await toast.present();
  }

  async presentToastWithOptions() {
    const resolver = Promise.resolve({a: 'a', b: 'b'});
    const toast = await this.toastController.create({
      header: this.header || '',
      message: this.message,
      cssClass: 'app-toast',
      position: 'top',
      buttons: [
        {
          // side: 'start',
          // icon: 'star',
          text: this.acceptButtonText || '',
          role: 'accept',
          handler: () => {
            if (this.actionOnAccept) {
              this.actionOnAccept({
                toast,
              });
            }
            return resolver;
          },
        }, {
          text: this.declineButtonText || '',
          role: 'decline',
          handler: () => {
            if (this.actionOnDecline) {
              this.actionOnDecline({
                toast,
              });
            }
          },
        },
      ],
    });
    await toast.present();
  }

}
