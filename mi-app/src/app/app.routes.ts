import { Routes } from '@angular/router';

import { Shell } from './layout/shell/shell';
import { Matriculas } from './pages/matriculas/matriculas';
import { Estudiantes } from './pages/estudiantes/estudiantes';
import { Profesores } from './pages/profesores/profesores';
import { Notas } from './pages/notas/notas';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', redirectTo: 'matriculas', pathMatch: 'full' },
      { path: 'matriculas', component: Matriculas },
      { path: 'estudiantes', component: Estudiantes },
      { path: 'profesores', component: Profesores }, 
      { path: 'notas', component: Notas },
    ],
  },
  { path: '**', redirectTo: 'matriculas' },
];
