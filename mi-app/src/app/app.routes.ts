import { Routes } from '@angular/router';

import { Shell } from './layout/shell/shell';
import { Matriculas } from './pages/matriculas/matriculas';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', redirectTo: 'matriculas', pathMatch: 'full' },
      { path: 'matriculas', component: Matriculas },
    ],
  },
  { path: '**', redirectTo: 'matriculas' },
];
