import { Injectable } from '@angular/core';
import { CanActivate, Route, CanLoad } from '@angular/router';
import { NavController } from '@ionic/angular';
import { UserService, VerifyTokenStatus } from 'src/app/services/user.service';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {
    constructor(
        private userService: UserService,
        private navController: NavController) {
    }

    canLoad(route: Route): boolean {
        return true;
    }

    canActivate() {
        if (this.userService.lastVerifiedStatus === VerifyTokenStatus.Unknown) {
            this.navController.navigateRoot('/');
            return false;
        }

        return true;
    }
}
