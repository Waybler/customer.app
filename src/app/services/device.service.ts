import { Injectable } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class DeviceService {
    constructor(private appVersion: AppVersion, private platform: Platform) {

    }
    public async getVersionNumber(): Promise<string> {
        return await this.appVersion.getVersionNumber();
    }

    public async isRunningOnDevice(): Promise<boolean> {
        return this.platform.is("cordova") && (this.platform.is("ios") || this.platform.is("android")) && !document.location.hostname.endsWith("cacharge.com");
    }

    public isSSL(): boolean {
        return document.location.protocol == "https:";
    }
}
