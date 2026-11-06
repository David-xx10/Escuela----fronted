import { Routes } from '@angular/router';

import { Shell } from './layout/shell/shell';
import { Evaluaciones } from './pages/evaluaciones/evaluaciones';
import { Matriculas } from './pages/matriculas/matriculas';
import { Facultades } from './pages/facultades/facultades';
import { Cursos } from './pages/cursos/cursos';
import { Grupos } from './pages/grupos/grupos';
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
      { path: 'facultades', component: Facultades },
      { path: 'cursos', component: Cursos },
      { path: 'grupos', component: Grupos },
      { path: 'estudiantes', component: Estudiantes },
      { path: 'profesores', component: Profesores },
      { path: 'notas', component: Notas },
      { path: 'evaluaciones', component: Evaluaciones },
      { path: 'periodos-academicos', component: PeriodosAcademicos },
    ],
  },
  { path: '**', redirectTo: 'matriculas' },
];
