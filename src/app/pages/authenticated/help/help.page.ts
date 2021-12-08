import { Component, OnInit } from '@angular/core';
import { LocaleService } from 'src/app/services/locale.service';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService } from 'src/app/services/user.service';
import { vendor } from 'src/environments/environment';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage {
  public t: ITranslator;
  public vendor = vendor;

  constructor(translatorFactoryService: TranslatorFactoryService, public userService: UserService, public localeService: LocaleService) {
    this.t = translatorFactoryService.create('pages.authenticated.help');
  }

  public toggle(x: any, v: any) {
    let question = x.srcElement;
    while (question.nodeName !== 'ION-ITEM') {
      question = question.parentNode;
    }

    if (v.el.attributes['show']) {
      v.el.removeAttribute('show');
      question.removeAttribute('expanded');
    } else {
      v.el.setAttribute('show', 'true');
      question.setAttribute('expanded', 'true');
    }
  }
}
