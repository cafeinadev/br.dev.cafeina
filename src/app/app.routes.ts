import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing').then((m) => m.Landing),
  },
  {
    path: 'design-system',
    loadComponent: () => import('./design-system/design-system').then((m) => m.DesignSystem),
  },
];
