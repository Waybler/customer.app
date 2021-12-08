import { Injectable } from '@angular/core';
import { CodePush, InstallMode, SyncStatus, DownloadProgress } from '@ionic-native/code-push/ngx';
import { TranslatorFactoryService, ITranslator } from './translator-factory.service';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { UserService } from './user.service';
import { tap, first, map } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { DeviceService } from './device.service';

export interface ICodePushPackage {
    label: string;
    beta: boolean;
    appVersion: string;
}

@Injectable({
    providedIn: 'root'
})
export class CodePushService {
    public t: ITranslator;

    public checkingForUpdate = false;
    public updating = false;
    public percentage = 0;
    public text = '';

    public updated: BehaviorSubject<boolean> = new BehaviorSubject(true);

    private cachedCodePushVersion: ICodePushPackage;
    public get codePushVersion$(): Observable<ICodePushPackage> {
        if (this.cachedCodePushVersion != null) {
            return of(this.cachedCodePushVersion);
        }

        return from(this.codePush.getCurrentPackage()).pipe(
            map(v => {
                if (v == null) {
                    return null;
                }

                return {
                    label: v.label,
                    appVersion: v.appVersion,
                    beta: v.deploymentKey === 'vkCfbdr8AeUx5VC_Q3ST1T2s0SqaHJHDlRVkr'
                        || v.deploymentKey === 'tN4UgM-UlODx-P7AEKKdaUewwUGKH1upl0EkB'
                };
            }),
            tap(v => {
                this.cachedCodePushVersion = v;
            })
        );
    }

    constructor(
        translateProviderFactory: TranslatorFactoryService,
        private codePush: CodePush,
        private userService: UserService,
        private platform: Platform,
        private deviceService: DeviceService
    ) {
        this.t = translateProviderFactory.create('services.code-push');
    }

    public async startSync(): Promise<void> {
        if (!await this.deviceService.isRunningOnDevice()) {
            return;
        }

        this.codePush.notifyApplicationReady();

        this.userService.beta$.pipe(
            first(),
            tap(beta => {
                let deploymentKey = null;
                if (beta) {
                    if (this.platform.is('android')) {
                        deploymentKey = 'vkCfbdr8AeUx5VC_Q3ST1T2s0SqaHJHDlRVkr';
                    } else if (this.platform.is('ios')) {
                        deploymentKey = 'tN4UgM-UlODx-P7AEKKdaUewwUGKH1upl0EkB';
                    }
                }

                this.codePush.sync(
                    { installMode: InstallMode.IMMEDIATE, deploymentKey: deploymentKey },
                    (dp: DownloadProgress) => this.downloadProgress(dp))
                    .subscribe((ss: SyncStatus) => {
                        return this.syncStatus(ss);
                    });
            })
        ).subscribe();
    }

    public syncStatus(status: SyncStatus): void {
        switch (status) {
            case SyncStatus.UP_TO_DATE:
            case SyncStatus.UPDATE_IGNORED:
            case SyncStatus.ERROR:
                this.checkingForUpdate = false;
                break;

            case SyncStatus.UPDATE_INSTALLED:
                this.text = this.t('restarting');
                break;

            case SyncStatus.CHECKING_FOR_UPDATE:
                this.checkingForUpdate = true;
                this.text = '';
                break;

            case SyncStatus.DOWNLOADING_PACKAGE:
                this.updating = true;
                this.text = this.t('downloading', { percentage: this.percentage });
                break;

            case SyncStatus.INSTALLING_UPDATE:
                this.text = this.t('installing');
                break;
        }

        this.updated.next(true);
    }

    public downloadProgress(downloadProgress: DownloadProgress): void {
        if (downloadProgress) {
            this.percentage = Math.floor((downloadProgress.receivedBytes / downloadProgress.totalBytes) * 100);
            this.text = this.t('downloading', { percentage: this.percentage });
        }
        this.updated.next(true);
    }
}
