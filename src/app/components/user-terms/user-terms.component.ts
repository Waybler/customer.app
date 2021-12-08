import { Component, ViewEncapsulation } from '@angular/core';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-user-terms',
    templateUrl: './user-terms.component.html',
    styleUrls: ['./user-terms.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom
})
export class UserTermsComponent {
    public expanded = false;
    public t: ITranslator;

    constructor(public userService: UserService, translatorFactoryService: TranslatorFactoryService) {
        this.t = translatorFactoryService.create('components.user-terms');
    }
}
