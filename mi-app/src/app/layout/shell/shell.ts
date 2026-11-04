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
  ];

  alternar(): void {
    this.expandido.update((valor) => !valor);
  }
}