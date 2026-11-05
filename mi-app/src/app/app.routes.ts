import { Routes } from '@angular/router';

import { Shell } from './layout/shell/shell';
import { Evaluaciones } from './pages/evaluaciones/evaluaciones';
import { Matriculas } from './pages/matriculas/matriculas';
import { Estudiantes } from './pages/estudiantes/estudiantes';
import { Profesores } from './pages/profesores/profesores';
import { Notas } from './pages/notas/notas';
import { PeriodosAcademicos } from './pages/periodos_academicos/periodos.academicos';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', redirectTo: 'matriculas', pathMatch: 'full' },
      { path: 'matriculas', component: Matriculas },
      { path: 'periodos-academicos', component: PeriodosAcademicos },
    ],
  },
  { path: '**', redirectTo: 'matriculas' },
];
