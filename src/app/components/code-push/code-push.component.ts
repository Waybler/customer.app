import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CodePushService } from 'src/app/services/code-push.service';

@Component({
    selector: 'app-code-push',
    templateUrl: './code-push.component.html',
    styleUrls: ['./code-push.component.scss']
})
export class CodePushComponent implements OnInit, OnDestroy {
    private updatedSubscription: Subscription;

    constructor(public codepushService: CodePushService, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.updatedSubscription = this.codepushService.updated.pipe(
            tap(() => {
                this.cdr.detectChanges();
            })
        ).subscribe();
    }

    ngOnDestroy() {
        this.updatedSubscription.unsubscribe();
    }
}
