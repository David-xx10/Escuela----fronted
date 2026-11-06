import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Evaluacion, EvaluacionCreate } from '../../models/evaluacion.model';
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
        this.filas.set([this.mapearFila(evaluacion)]);
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
      id_estudiante: fila.id_estudiante ?? '',
      id_curso: fila.id_curso ?? '',
      id_grupo: fila.id_grupo ?? '',
      tipo_evaluacion: fila.tipo_evaluacion ?? fila.tipo ?? '',
      nota: fila.nota ?? fila.valor_maximo ?? '',
      fecha_evaluacion: fila.fecha_evaluacion ?? fila.fecha ?? '',
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
    const payload = this.prepararPayload();

    if (this.modo() === 'crear') {
      this.evaluacionService.crear(payload).subscribe({
        next: () => this.despuesDeGuardar('Evaluacion creada'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
      return;
    }

    this.evaluacionService.actualizar(this.idEditando, payload).subscribe({
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
        const normalizadas = (filas ?? []).map((fila) => this.mapearFila(fila));
        this.filas.set(normalizadas);
        this.avisar(normalizadas.length ? '' : 'No hay registros');
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
    const idEstudiante = String(this.formulario.id_estudiante ?? '').trim();
    const idGrupo = String(this.formulario.id_grupo ?? '').trim();
    const tipo = String(this.formulario.tipo_evaluacion ?? '').trim();
    const nota = String(this.formulario.nota ?? '').trim();
    const fecha = String(this.formulario.fecha_evaluacion ?? '').trim();

    return Boolean(idEstudiante && idGrupo && tipo && nota && fecha);
  }

  private prepararPayload(): EvaluacionCreate {
    const idEstudiante = this.normalizarEntero(this.formulario.id_estudiante);
    const idCurso = this.normalizarEnteroOpcional(this.formulario.id_curso);
    const idGrupo = this.normalizarEntero(this.formulario.id_grupo);
    const tipo = String(this.formulario.tipo_evaluacion ?? '').trim();
    const nota = this.normalizarNumero(this.formulario.nota);
    const fecha = String(this.formulario.fecha_evaluacion ?? '').trim();

    const descripcion = [
      idEstudiante !== null ? `Estudiante ${idEstudiante}` : 'Estudiante sin id',
      idCurso !== null ? `Curso ${idCurso}` : 'Curso opcional',
      tipo,
    ].join(' - ');

    return {
      nombre: tipo || 'Evaluación',
      descripcion,
      tipo,
      id_grupo: idGrupo ?? 0,
      fecha,
      valor_maximo: nota ?? 0,
    } as EvaluacionCreate;
  }

  private mapearFila(fila: Evaluacion): Evaluacion {
    return {
      id_evaluacion: fila.id_evaluacion,
      id_estudiante: fila.id_estudiante ?? '',
      id_curso: fila.id_curso ?? '',
      id_grupo: fila.id_grupo ?? '',
      tipo_evaluacion: fila.tipo_evaluacion ?? fila.tipo ?? '',
      nota: fila.nota ?? fila.valor_maximo ?? '',
      fecha_evaluacion: fila.fecha_evaluacion ?? fila.fecha ?? '',
    };
  }

  private normalizarEntero(valor: number | string | null | undefined): number | null {
    if (valor === null || valor === undefined || String(valor).trim() === '') {
      return null;
    }

    const numero = Number(valor);
    return Number.isInteger(numero) ? numero : null;
  }

  private normalizarEnteroOpcional(valor: number | string | null | undefined): number | null {
    if (valor === null || valor === undefined || String(valor).trim() === '') {
      return null;
    }

    const numero = Number(valor);
    return Number.isInteger(numero) ? numero : null;
  }

  private normalizarNumero(valor: number | string | null | undefined): number | null {
    if (valor === null || valor === undefined || String(valor).trim() === '') {
      return null;
    }

    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
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
      return 'Revisa los datos. El formato de la evaluacion no coincide con la API.';
    }
    const detail = error.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    return 'No se pudo completar la operacion';
  }
}
