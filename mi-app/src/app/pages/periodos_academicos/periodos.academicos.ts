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
        this.filas.set([this.normalizarPeriodo(periodo)]);
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
    const filaNormalizada = this.normalizarPeriodo(fila);
    this.modo.set('editar');
    this.idEditando = String(filaNormalizada.id_periodo_academico ?? '');
    this.formulario = {
      nombre: filaNormalizada.nombre,
      fecha_inicio: filaNormalizada.fecha_inicio,
      fecha_fin: filaNormalizada.fecha_fin,
      estado: filaNormalizada.estado,
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
    const id = Number(
      fila.id_periodo_academico ?? fila.id_periodo ?? (fila as { id?: number }).id ?? 0,
    );
    if (!Number.isFinite(id) || id <= 0) {
      this.avisar('No se pudo identificar el periodo academico para eliminarlo.', true);
      return;
    }

    const confirmar = confirm(`Eliminar el periodo academico ${id}?`);
    if (!confirmar) {
      return;
    }

    this.cargando.set(true);
    this.periodoAcademicoService.eliminar(id).subscribe({
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
        const filasNormalizadas = (filas ?? []).map((fila) => this.normalizarPeriodo(fila));
        this.filas.set(filasNormalizadas);
        this.avisar(filasNormalizadas.length ? '' : 'No hay registros');
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

  private normalizarPeriodo(periodo: Partial<PeriodoAcademico> | null | undefined): PeriodoAcademico {
    const datos = (periodo ?? {}) as Record<string, unknown>;
    const id = Number(
      datos['id_periodo_academico'] ?? datos['id_periodo'] ?? datos['id'] ?? 0,
    );

    return {
      id_periodo_academico: Number.isFinite(id) && id > 0 ? id : undefined,
      id_periodo: Number.isFinite(id) && id > 0 ? id : undefined,
      nombre: String(datos['nombre'] ?? '').trim(),
      fecha_inicio: this.normalizarFecha(datos['fecha_inicio'] ?? datos['fechaInicio']),
      fecha_fin: this.normalizarFecha(datos['fecha_fin'] ?? datos['fechaFin']),
      estado: this.normalizarEstado(datos['estado']),
    };
  }

  private normalizarFecha(valor: unknown): string {
    const texto = String(valor ?? '').trim();
    if (!texto) {
      return '';
    }

    const coincidencia = texto.match(/^(\d{4}-\d{2}-\d{2})/);
    if (coincidencia) {
      return coincidencia[1];
    }

    const fecha = new Date(texto);
    if (!Number.isNaN(fecha.getTime())) {
      return fecha.toISOString().slice(0, 10);
    }

    return texto;
  }

  private normalizarEstado(valor: unknown): string {
    const texto = String(valor ?? '').trim();
    if (!texto) {
      return 'activo';
    }

    const valorNormalizado = texto.toLowerCase();
    if (['1', 'true', 'activo', 'activa', 'active'].includes(valorNormalizado)) {
      return 'activo';
    }
    if (['0', 'false', 'inactivo', 'inactiva', 'inactive'].includes(valorNormalizado)) {
      return 'inactivo';
    }

    return valorNormalizado.includes('inactivo') ? 'inactivo' : 'activo';
  }

  private formularioValido(): boolean {
    const datos = this.formulario;
    const nombre = String(datos.nombre ?? '').trim();
    const fechaInicio = String(datos.fecha_inicio ?? '').trim();
    const fechaFin = String(datos.fecha_fin ?? '').trim();
    const estado = this.normalizarEstado(datos.estado).trim();

    return Boolean(nombre && fechaInicio && fechaFin && estado);
  }

  private datosEdicion(): PeriodoAcademicoUpdate {
    return {
      nombre: this.formulario.nombre.trim(),
      fecha_inicio: this.normalizarFecha(this.formulario.fecha_inicio),
      fecha_fin: this.normalizarFecha(this.formulario.fecha_fin),
      estado: this.normalizarEstado(this.formulario.estado),
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
