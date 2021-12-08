import { Component, OnInit } from '@angular/core';
import { tap, first, mergeMap } from 'rxjs/operators';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService, ZoneInfoStatus } from 'src/app/services/user.service';
import { ActivatedRoute } from '@angular/router';

declare var webkit: any;

@Component({
    //selector: 'app-charge',
    templateUrl: './zone-add.page.html',
    styleUrls: ['./zone-add.page.scss']
})
export class ZoneAddPage implements OnInit {
    public t: ITranslator;

    public data: any;

    constructor(
        private userService: UserService,
        private route: ActivatedRoute,
        translatorFactoryService: TranslatorFactoryService,
    ) {
        this.t = translatorFactoryService.create('pages.authenticated.charge');
    }

    public ngOnInit(): void {
        this.route.params.pipe(
            first(),
            mergeMap(routeParams => this.userService.getZoneInfo(routeParams['zoneCode'])),
            tap(result => {
                switch (result.Status) {
                    case ZoneInfoStatus.Valid:
                        this.data = result.Data;
                        break;
                    default:
                        this.close();
                        break;
                }
            })
        ).subscribe();
    }

    public close(): void {
        webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({ event: 'close', success: false }));
    }
}
