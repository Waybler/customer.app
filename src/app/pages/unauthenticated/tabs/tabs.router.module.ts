import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../auth-guard.service';

const routes: Routes = [
    {
        path: 'tabs',
        component: TabsPage,
        canActivate: [AuthGuard],
        canLoad: [AuthGuard],
        children: [
            {
                path: 'login',
                children: [{ path: '', loadChildren: () => import('./../login/login.module').then(m => m.LoginPageModule) }                ]
            },
            {
                path: '', redirectTo: 'tabs/login', pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        redirectTo: 'tabs/login',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class TabsPageRoutingModule { }
