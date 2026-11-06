import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Facultad, FacultadInput } from '../../models/facultad.model';
import { FacultadService } from '../../services/facultad.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-facultades',
  imports: [FormsModule],
  templateUrl: './facultades.html',
  styleUrl: './facultades.css',
})
export class Facultades implements OnInit {
  private readonly service = inject(FacultadService);
  readonly filas = signal<Facultad[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');
  idFiltro = '';
  formulario: FacultadInput = this.formularioVacio();
  private idEditando = '';

  ngOnInit(): void { this.cargarTodos(); }

  buscarPorId(): void {
    const id = this.idFiltro.trim();
    if (!id) { this.cargarTodos(); return; }
    this.cargando.set(true);
    this.service.getById(id).subscribe({
      next: (fila) => { this.filas.set([fila]); this.avisar(''); this.cargando.set(false); },
      error: (error: HttpErrorResponse) => this.fallo(error, false),
    });
  }

  limpiarFiltro(): void { this.idFiltro = ''; this.cargarTodos(); }
  abrirCrear(): void {
    this.modo.set('crear'); this.idEditando = ''; this.formulario = this.formularioVacio();
    this.popupAbierto.set(true);
  }
  abrirEditar(fila: Facultad): void {
    this.modo.set('editar'); this.idEditando = String(fila.id_facultad);
    this.formulario = { nombre: fila.nombre }; this.popupAbierto.set(true);
  }
  cerrarPopup(): void { this.popupAbierto.set(false); }

  guardar(): void {
    if (!this.formulario.nombre.trim()) { this.avisar('Completa el nombre.', true); return; }
    this.cargando.set(true);
    const peticion = this.modo() === 'crear'
      ? this.service.create(this.formulario)
      : this.service.update(this.idEditando, this.formulario);
    peticion.subscribe({
      next: () => { this.popupAbierto.set(false); this.avisar(this.modo() === 'crear' ? 'Facultad creada' : 'Facultad actualizada'); this.refrescar(); },
      error: (error: HttpErrorResponse) => this.fallo(error, false),
    });
  }

  eliminar(fila: Facultad): void {
    if (!confirm(`Eliminar la facultad ${fila.id_facultad}?`)) return;
    this.cargando.set(true);
    this.service.delete(fila.id_facultad).subscribe({
      next: () => { this.avisar('Facultad eliminada'); this.refrescar(); },
      error: (error: HttpErrorResponse) => this.fallo(error, false),
    });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.service.getAll().subscribe({
      next: (filas) => { this.filas.set(filas ?? []); this.avisar(filas?.length ? '' : 'No hay registros'); this.cargando.set(false); },
      error: (error: HttpErrorResponse) => this.fallo(error, true),
    });
  }
  private refrescar(): void { this.idFiltro.trim() ? this.buscarPorId() : this.cargarTodos(); }
  private formularioVacio(): FacultadInput { return { nombre: '' }; }
  private avisar(texto: string, error = false): void { this.mensaje.set(texto); this.esError.set(error && !!texto); }
  private fallo(error: HttpErrorResponse, alListar: boolean): void {
    this.filas.set(alListar ? [] : this.filas());
    this.avisar(error.status === 0 ? 'No se pudo conectar con la API.' : error.status === 404 ? (alListar ? 'No hay registros' : 'No encontrado') : 'No se pudo completar la operacion', error.status !== 404 || !alListar);
    this.cargando.set(false);
  }
}
