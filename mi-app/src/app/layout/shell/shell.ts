import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {

  readonly expandido = signal(true);

  readonly menu = [
    { ruta: '/matriculas', etiqueta: 'Matriculas' },
    { ruta: '/estudiantes', etiqueta: 'Estudiantes' },
    { ruta: '/profesores', etiqueta: 'Profesores' },
    { ruta: '/notas', etiqueta: 'Notas' },
    { ruta: '/evaluaciones', etiqueta: 'Evaluaciones' },
    { ruta: '/periodos-academicos', etiqueta: 'Periodos Academicos' },
  ];

  alternar(): void {
    this.expandido.update((valor) => !valor);
  }
}