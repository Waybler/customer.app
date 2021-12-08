import { Component } from '@angular/core';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.page.html',
    styleUrls: ['./tabs.page.scss'],
})
export class TabsPage {
    public t: ITranslator;

    constructor(
        translateProviderFactory: TranslatorFactoryService,
        public userService: UserService
    ) {
        this.t = translateProviderFactory.create('pages.authenticated.tabs');
    }
}
