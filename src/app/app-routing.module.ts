import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('./pages/start/start.module').then(m => m.StartPageModule) },
  { path: 'unauthenticated', loadChildren: () => import('./pages/unauthenticated/tabs/tabs.module').then(m => m.TabsPageModule) },
  { path: 'authenticated/economy/add-payment-method', loadChildren: () => import('./pages/authenticated/economy/add-payment-method.module').then(m => m.AddPaymentMethodPageModule) },
  { path: 'authenticated/charge/zone-add/:zoneCode', loadChildren: () => import('./pages/authenticated/charge/zone-add.module').then(m => m.ZoneAddPageModule) },
  { path: 'authenticated', loadChildren: () => import('./pages/authenticated/tabs/tabs.module').then(m => m.TabsPageModule) },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
