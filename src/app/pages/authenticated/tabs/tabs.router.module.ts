import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../auth-guard.service';
import {TabsPage} from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],

    children: [
      {path: 'charge', children: [{path: '', loadChildren: () => import('../charge/charge.module').then(m => m.ChargePageModule)}]},
      {path: 'history', children: [{path: '', loadChildren: () => import('../history/history.module').then(m => m.HistoryPageModule)}]},
      {path: 'economy', children: [{path: '', loadChildren: () => import('../economy/economy.module').then(m => m.EconomyPageModule)}]},
      {path: 'help', children: [{path: '', loadChildren: () => import('../help/help.module').then(m => m.HelpPageModule)}]},
      {path: 'settings', children: [{path: '', loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)}]},
      {path: '', redirectTo: 'tabs/charge', pathMatch: 'full'}
    ]
  },
  {
    path: '',
    redirectTo: 'tabs/charge',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {
}
