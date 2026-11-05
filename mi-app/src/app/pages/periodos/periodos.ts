import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PeriodoAcademico, PeriodoInput } from '../../models/periodo.model';
import { PeriodoService } from '../../services/periodo.service';

type ModoPopup = 'crear' | 'editar';

@Component({ selector: 'app-periodos', imports: [FormsModule], templateUrl: './periodos.html', styleUrl: './periodos.css' })
export class Periodos implements OnInit {
  private readonly service = inject(PeriodoService);
  readonly filas = signal<PeriodoAcademico[]>([]); readonly mensaje = signal(''); readonly esError = signal(false); readonly cargando = signal(false); readonly popupAbierto = signal(false); readonly modo = signal<ModoPopup>('crear');
  idFiltro = ''; formulario: PeriodoInput = this.vacio(); private idEditando = '';
  ngOnInit(): void { this.cargarTodos(); }
  buscarPorId(): void { const id = this.idFiltro.trim(); if (!id) { this.cargarTodos(); return; } this.cargando.set(true); this.service.getById(id).subscribe({ next: (fila) => { this.filas.set([fila]); this.avisar(''); this.cargando.set(false); }, error: (e: HttpErrorResponse) => this.fallo(e, false) }); }
  limpiarFiltro(): void { this.idFiltro = ''; this.cargarTodos(); }
  abrirCrear(): void { this.modo.set('crear'); this.idEditando = ''; this.formulario = this.vacio(); this.popupAbierto.set(true); }
  abrirEditar(fila: PeriodoAcademico): void { this.modo.set('editar'); this.idEditando = String(fila.id_periodo); this.formulario = { nombre: fila.nombre }; this.popupAbierto.set(true); }
  cerrarPopup(): void { this.popupAbierto.set(false); }
  guardar(): void {
    if (!this.formulario.nombre.trim()) { this.avisar('Completa el nombre.', true); return; } this.cargando.set(true);
    const peticion = this.modo() === 'crear' ? this.service.create(this.formulario) : this.service.update(this.idEditando, this.formulario);
    peticion.subscribe({ next: () => { this.popupAbierto.set(false); this.avisar(this.modo() === 'crear' ? 'Periodo creado' : 'Periodo actualizado'); this.refrescar(); }, error: (e: HttpErrorResponse) => this.fallo(e, false) });
  }
  eliminar(fila: PeriodoAcademico): void { if (!confirm(`Eliminar el periodo ${fila.id_periodo}?`)) return; this.cargando.set(true); this.service.delete(fila.id_periodo).subscribe({ next: () => { this.avisar('Periodo eliminado'); this.refrescar(); }, error: (e: HttpErrorResponse) => this.fallo(e, false) }); }
  private cargarTodos(): void { this.cargando.set(true); this.service.getAll().subscribe({ next: (filas) => { this.filas.set(filas ?? []); this.avisar(filas?.length ? '' : 'No hay registros'); this.cargando.set(false); }, error: (e: HttpErrorResponse) => this.fallo(e, true) }); }
  private refrescar(): void { this.idFiltro.trim() ? this.buscarPorId() : this.cargarTodos(); }
  private vacio(): PeriodoInput { return { nombre: '' }; }
  private avisar(texto: string, error = false): void { this.mensaje.set(texto); this.esError.set(error && !!texto); }
  private fallo(e: HttpErrorResponse, alListar: boolean): void { this.filas.set(alListar ? [] : this.filas()); this.avisar(e.status === 0 ? 'No se pudo conectar con la API.' : e.status === 404 ? (alListar ? 'No hay registros' : 'No encontrado') : 'No se pudo completar la operacion', e.status !== 404 || !alListar); this.cargando.set(false); }
}
