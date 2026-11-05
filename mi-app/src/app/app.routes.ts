import { Routes } from '@angular/router';

import { Shell } from './layout/shell/shell';
import { Matriculas } from './pages/matriculas/matriculas';
import { Facultades } from './pages/facultades/facultades';
import { Cursos } from './pages/cursos/cursos';
import { Grupos } from './pages/grupos/grupos';
import { Periodos } from './pages/periodos/periodos';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', redirectTo: 'matriculas', pathMatch: 'full' },
      { path: 'matriculas', component: Matriculas },
      { path: 'facultades', component: Facultades },
      { path: 'cursos', component: Cursos },
      { path: 'grupos', component: Grupos },
      { path: 'periodos', component: Periodos },
    ],
  },
  { path: '**', redirectTo: 'matriculas' },
];
