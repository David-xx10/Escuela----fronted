import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Matricula,
  MatriculaCreate,
  MatriculaUpdate,
} from '../../models/matricula.model';
import { MatriculaService } from '../../services/matricula.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-matriculas',
  imports: [FormsModule],
  templateUrl: './matriculas.html',
  styleUrl: './matriculas.css',
})
export class Matriculas implements OnInit {
  private readonly matriculaService = inject(MatriculaService);

  readonly filas = signal<Matricula[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario: MatriculaCreate = this.formularioVacio();
  private idEditando = '';

  ngOnInit(): void {
    this.cargarTodos();
  }

  buscarPorId(): void {
    const id = this.idFiltro.trim();
    if (!id) {
      this.cargarTodos();
      return;
    }

    this.cargando.set(true);
    this.matriculaService.obtener(id).subscribe({
      next: (matricula) => {
        this.filas.set([matricula]);
        this.avisar('');
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.filas.set([]);
        this.avisar(this.textoError(error, false), true);
        this.cargando.set(false);
      },
    });
  }

  limpiarFiltro(): void {
    this.idFiltro = '';
    this.cargarTodos();
  }

  abrirCrear(): void {
    this.modo.set('crear');
    this.idEditando = '';
    this.formulario = this.formularioVacio();
    this.popupAbierto.set(true);
  }

  abrirEditar(fila: Matricula): void {
    this.modo.set('editar');
    this.idEditando = String(fila.id_matricula);
    this.formulario = {
      id_estudiante: fila.id_estudiante,
      id_curso: fila.id_curso ?? '',
      id_grupo: fila.id_grupo ?? '',
      fecha_matricula: fila.fecha_matricula,
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void {
    this.popupAbierto.set(false);
  }

  guardar(): void {
    if (!this.formularioValido()) {
      this.avisar('Completa estudiante y fecha.', true);
      return;
    }

    this.cargando.set(true);
    if (this.modo() === 'crear') {
      this.matriculaService.crear(this.formulario).subscribe({
        next: () => this.despuesDeGuardar('Matricula creada'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
      return;
    }

    this.matriculaService.actualizar(this.idEditando, this.datosEdicion()).subscribe({
      next: () => this.despuesDeGuardar('Matricula actualizada'),
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  eliminar(fila: Matricula): void {
    const confirmar = confirm(`Eliminar la matricula ${fila.id_matricula}?`);
    if (!confirmar) {
      return;
    }

    this.cargando.set(true);
    this.matriculaService.eliminar(fila.id_matricula).subscribe({
      next: () => {
        this.avisar('Matricula eliminada');
        this.refrescar();
      },
      error: (error: HttpErrorResponse) => {
        this.avisar(this.textoError(error, false), true);
        this.cargando.set(false);
      },
    });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.matriculaService.listar().subscribe({
      next: (filas) => {
        this.filas.set(filas ?? []);
        this.avisar(filas.length ? '' : 'No hay registros');
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.filas.set([]);
        const listaVacia = error.status === 404;
        this.avisar(listaVacia ? 'No hay registros' : this.textoError(error, true), !listaVacia);
        this.cargando.set(false);
      },
    });
  }

  private refrescar(): void {
    if (this.idFiltro.trim()) {
      this.buscarPorId();
      return;
    }
    this.cargarTodos();
  }

  private despuesDeGuardar(texto: string): void {
    this.popupAbierto.set(false);
    this.avisar(texto);
    this.refrescar();
  }

  private falloGuardar(error: HttpErrorResponse): void {
    this.avisar(this.textoError(error, false), true);
    this.cargando.set(false);
  }

  private formularioValido(): boolean {
    const datos = this.formulario;
    const idEstudiante = String(datos.id_estudiante ?? '').trim();
    const fecha = String(datos.fecha_matricula ?? '').trim();

    return Boolean(idEstudiante && fecha);
  }

  private datosEdicion(): MatriculaUpdate {
    const datos: MatriculaUpdate = {
      id_estudiante: this.formulario.id_estudiante,
      id_curso: this.formulario.id_curso ?? null,
      id_grupo: this.formulario.id_grupo ?? null,
      fecha_matricula: this.formulario.fecha_matricula.trim(),
    };

    return datos;
  }

  private formularioVacio(): MatriculaCreate {
    return {
      id_estudiante: '',
      id_curso: '',
      id_grupo: '',
      fecha_matricula: '',
    };
  }

  private avisar(texto: string, error = false): void {
    this.mensaje.set(texto);
    this.esError.set(error && texto.length > 0);
  }

  private textoError(error: HttpErrorResponse, alListar: boolean): string {
    if (error.status === 0) {
      return 'No se pudo conectar con la API. Revisa que el backend este en el puerto 8000.';
    }
    if (error.status === 404) {
      return alListar ? 'No hay registros' : 'No encontrado';
    }
    if (error.status === 409) {
      return 'Esa matricula ya existe';
    }
    if (error.status === 422) {
      return 'Revisa los datos. El ID debe ser un número entero.';
    }
    const detail = error.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    return 'No se pudo completar la operacion';
  }
}