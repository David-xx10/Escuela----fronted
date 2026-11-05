import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Evaluacion,
  EvaluacionCreate,
  EvaluacionUpdate,
} from '../../models/evaluacion.model';
import { EvaluacionService } from '../../services/evaluacion.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-evaluaciones',
  imports: [FormsModule],
  templateUrl: './evaluaciones.html',
  styleUrl: './evaluaciones.css',
})
export class Evaluaciones implements OnInit {
  private readonly evaluacionService = inject(EvaluacionService);

  readonly filas = signal<Evaluacion[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario: EvaluacionCreate = this.formularioVacio();
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
    this.evaluacionService.obtener(id).subscribe({
      next: (evaluacion) => {
        this.filas.set([evaluacion]);
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

  abrirEditar(fila: Evaluacion): void {
    this.modo.set('editar');
    this.idEditando = String(fila.id_evaluacion);
    this.formulario = {
      id_estudiante: fila.id_estudiante,
      id_curso: fila.id_curso ?? '',
      id_grupo: fila.id_grupo ?? '',
      tipo_evaluacion: fila.tipo_evaluacion,
      nota: fila.nota,
      fecha_evaluacion: fila.fecha_evaluacion,
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void {
    this.popupAbierto.set(false);
  }

  guardar(): void {
    if (!this.formularioValido()) {
      this.avisar('Completa estudiante, tipo, nota y fecha.', true);
      return;
    }

    this.cargando.set(true);
    if (this.modo() === 'crear') {
      this.evaluacionService.crear(this.formulario).subscribe({
        next: () => this.despuesDeGuardar('Evaluacion creada'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
      return;
    }

    this.evaluacionService.actualizar(this.idEditando, this.datosEdicion()).subscribe({
      next: () => this.despuesDeGuardar('Evaluacion actualizada'),
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  eliminar(fila: Evaluacion): void {
    const confirmar = confirm(`Eliminar la evaluacion ${fila.id_evaluacion}?`);
    if (!confirmar) {
      return;
    }

    this.cargando.set(true);
    this.evaluacionService.eliminar(fila.id_evaluacion).subscribe({
      next: () => {
        this.avisar('Evaluacion eliminada');
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
    this.evaluacionService.listar().subscribe({
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
    const tipo = String(datos.tipo_evaluacion ?? '').trim();
    const nota = String(datos.nota ?? '').trim();
    const fecha = String(datos.fecha_evaluacion ?? '').trim();

    return Boolean(idEstudiante && tipo && nota && fecha);
  }

  private datosEdicion(): EvaluacionUpdate {
    const datos: EvaluacionUpdate = {
      id_estudiante: this.formulario.id_estudiante,
      id_curso: this.formulario.id_curso ?? null,
      id_grupo: this.formulario.id_grupo ?? null,
      tipo_evaluacion: this.formulario.tipo_evaluacion.trim(),
      nota: this.formulario.nota,
      fecha_evaluacion: this.formulario.fecha_evaluacion.trim(),
    };

    return datos;
  }

  private formularioVacio(): EvaluacionCreate {
    return {
      id_estudiante: '',
      id_curso: '',
      id_grupo: '',
      tipo_evaluacion: '',
      nota: '',
      fecha_evaluacion: '',
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
      return 'Esa evaluacion ya existe';
    }
    if (error.status === 422) {
      return 'Revisa los datos. El ID debe ser un numero entero.';
    }
    const detail = error.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    return 'No se pudo completar la operacion';
  }
}
