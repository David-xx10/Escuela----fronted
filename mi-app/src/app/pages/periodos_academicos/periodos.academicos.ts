import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  PeriodoAcademico,
  PeriodoAcademicoCreate,
  PeriodoAcademicoUpdate,
} from '../../models/periodoAcademico.model';
import { PeriodoAcademicoService } from '../../services/periodoAcademico.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-periodos-academicos',
  imports: [FormsModule],
  templateUrl: './periodos_academicos.html',
  styleUrl: './periodos_academicos.css',
})
export class PeriodosAcademicos implements OnInit {
  private readonly periodoAcademicoService = inject(PeriodoAcademicoService);

  readonly filas = signal<PeriodoAcademico[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario: PeriodoAcademicoCreate = this.formularioVacio();
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
    this.periodoAcademicoService.obtener(id).subscribe({
      next: (periodo) => {
        this.filas.set([periodo]);
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

  abrirEditar(fila: PeriodoAcademico): void {
    this.modo.set('editar');
    this.idEditando = String(fila.id_periodo_academico);
    this.formulario = {
      nombre: fila.nombre,
      fecha_inicio: fila.fecha_inicio,
      fecha_fin: fila.fecha_fin,
      estado: fila.estado,
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void {
    this.popupAbierto.set(false);
  }

  guardar(): void {
    if (!this.formularioValido()) {
      this.avisar('Completa nombre, fechas y estado.', true);
      return;
    }

    this.cargando.set(true);
    if (this.modo() === 'crear') {
      this.periodoAcademicoService.crear(this.formulario).subscribe({
        next: () => this.despuesDeGuardar('Periodo academico creado'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
      return;
    }

    this.periodoAcademicoService.actualizar(this.idEditando, this.datosEdicion()).subscribe({
      next: () => this.despuesDeGuardar('Periodo academico actualizado'),
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  eliminar(fila: PeriodoAcademico): void {
    const confirmar = confirm(`Eliminar el periodo academico ${fila.id_periodo_academico}?`);
    if (!confirmar) {
      return;
    }

    this.cargando.set(true);
    this.periodoAcademicoService.eliminar(fila.id_periodo_academico).subscribe({
      next: () => {
        this.avisar('Periodo academico eliminado');
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
    this.periodoAcademicoService.listar().subscribe({
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
    const nombre = String(datos.nombre ?? '').trim();
    const fechaInicio = String(datos.fecha_inicio ?? '').trim();
    const fechaFin = String(datos.fecha_fin ?? '').trim();
    const estado = String(datos.estado ?? '').trim();

    return Boolean(nombre && fechaInicio && fechaFin && estado);
  }

  private datosEdicion(): PeriodoAcademicoUpdate {
    return {
      nombre: this.formulario.nombre.trim(),
      fecha_inicio: this.formulario.fecha_inicio.trim(),
      fecha_fin: this.formulario.fecha_fin.trim(),
      estado: this.formulario.estado.trim(),
    };
  }

  private formularioVacio(): PeriodoAcademicoCreate {
    return {
      nombre: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'activo',
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
      return 'Ese periodo academico ya existe';
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
