import { Component, OnInit, OnDestroy } from '@angular/core';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { SessionService } from 'src/app/services/session.service';
import { UserService } from 'src/app/services/user.service';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { HistoryForDay } from '../../../models/history';

function fixMonth(month: number): string {
  if (month < 10) {
    return `0${month}`;
  }

  return month.toString();
}

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit, OnDestroy {
  public selectedDate: string;
  public maxDate: string;

  public t: ITranslator;
  public colorScheme = {
    domain: ['#197f44'],
  };
  sessionsSubscription: Subscription;

  constructor(
    public userService: UserService,
    public sessionService: SessionService,
    translatorFactoryService: TranslatorFactoryService,
  ) {
    this.t = translatorFactoryService.create('pages.authenticated.history');
    const date = new Date();

    this.selectedDate = `${date.getFullYear()}-${fixMonth(date.getMonth() + 1)}-01T00:00:00Z`;
    this.maxDate = this.selectedDate;
  }

  ngOnInit(): void {
    this.sessionsSubscription = this.sessionService.sessionUpdates$.pipe(
      filter((data: any) => data.status === 3),
    ).subscribe(() => this.internalDateSelected(this.selectedDate));
  }

  ngOnDestroy(): void {
    this.sessionsSubscription.unsubscribe();
  }

  ionViewWillEnter() {
    this.internalDateSelected(this.selectedDate);
  }


  public dateSelected(event: any): void {
    this.internalDateSelected(event.detail.value);
  }

  private internalDateSelected(value: string): void {
    this.selectedDate = value;
    this.userService.setHistoryPeriod(value);
  }

  public formatX(dateString: string): number {
    return new Date(dateString).getDate();
  }

  public formatY(value: number): any {
    return `${value} kWh`;
  }

  public sortHistory(monthlyHistory: HistoryForDay[]) {
    return monthlyHistory.sort((x, y) => x.date < y.date ? 1 : -1);
  }


}
