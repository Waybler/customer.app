import { Component } from '@angular/core';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';

@Component({
    selector: 'app-tabs',
    templateUrl: 'tabs.page.html',
    styleUrls: ['tabs.page.scss']
})
export class TabsPage {
    public t: ITranslator;

    constructor(translateProviderFactory: TranslatorFactoryService) {
        this.t = translateProviderFactory.create('pages.unauthenticated.tabs');
    }
}
