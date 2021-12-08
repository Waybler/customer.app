import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonDatetime } from '@ionic/angular';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';

function fix(value: number): string {
  if (value < 10) {
    return '0' + value;
  }
  return value.toString();
}

@Component({
  selector: 'app-heater-options',
  templateUrl: './heater-options.component.html',
  styleUrls: ['./heater-options.component.scss'],
})
export class HeaterOptionsComponent implements OnInit {
  private offset: number = -(new Date().getTimezoneOffset() / 60);

  @ViewChild('time') timePicker: IonDatetime;
  public dateOffset = 1;
  public t: ITranslator;

  public departureTime: Date;
  public showToday = true;

  constructor(private modalController: ModalController, translatorFactoryService: TranslatorFactoryService) {
    this.t = translatorFactoryService.create('pages.authenticated.charge.components.heater-options');
    const now = new Date();
    if (now.getHours() > 23 && now.getMinutes() > 40) {
      this.showToday = false;
    }
  }

  ngOnInit() {
  }

  public closeModal(): void {
    this.modalController.dismiss();
  }

  public dateSelected() {
    this.calculate();
  }

  public timeSelected() {
    this.calculate();
  }

  private calculate(): void {
    if (this.timePicker == null) {
      return;
    }

    let hours = 0;
    let minutes = 0;
    if (this.timePicker.value != null) {
      const tempDate = new Date(this.timePicker.value);
      hours = tempDate.getHours();
      minutes = tempDate.getMinutes();
    }

    this.timePicker.value == null ? ['00', '00'] : this.timePicker.value.split(':');

    const now = new Date();
    const dd = now.getDate();
    const mm = now.getMonth();
    const yyyy = now.getFullYear();

    if (this.dateOffset === -2) {
      this.departureTime = new Date(now.getTime() + 7200000);
    } else {
      const baseDate = new Date(yyyy, mm, dd, hours, minutes);
      this.departureTime = new Date(baseDate.getTime() + this.dateOffset * 86400000);
    }

    if (this.departureTime.getTime() < new Date().getTime()) {
      this.timePicker.value = undefined;
    }

    if (this.dateOffset === 0) {
      const min = new Date(Math.ceil(new Date().getTime() / 900000) * 900000);
      this.timePicker.min = `${yyyy}-${fix(mm + 1)}-${fix(dd)}T${fix(min.getHours())}:${fix(min.getMinutes())}:00.000Z`;
    } else {
      this.timePicker.min = `${yyyy}-${fix(mm + 1)}-${fix(dd)}T00:00:00.000Z`;
    }
  }

  public start(): void {
    const dd = this.departureTime.getDate();
    const mm = this.departureTime.getMonth();
    const yyyy = this.departureTime.getFullYear();

    this.modalController.dismiss({
      date: `${yyyy}-${fix(mm + 1)}-${fix(dd)}`,
      time: `${fix(this.departureTime.getHours())}:${fix(this.departureTime.getMinutes())}`,
      offset: this.offset,
    });
  }
}
