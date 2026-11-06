import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Grupo, GrupoInput } from '../../models/grupo.model';
import { GrupoService } from '../../services/grupo.service';

type ModoPopup = 'crear' | 'editar';

@Component({ selector: 'app-grupos', imports: [FormsModule], templateUrl: './grupos.html', styleUrl: './grupos.css' })
export class Grupos implements OnInit {
  private readonly service = inject(GrupoService);
  readonly filas = signal<Grupo[]>([]); readonly mensaje = signal(''); readonly esError = signal(false); readonly cargando = signal(false); readonly popupAbierto = signal(false); readonly modo = signal<ModoPopup>('crear');
  idFiltro = ''; formulario: GrupoInput = this.vacio(); private idEditando = '';
  ngOnInit(): void { this.cargarTodos(); }
  buscarPorId(): void { const id = this.idFiltro.trim(); if (!id) { this.cargarTodos(); return; } this.cargando.set(true); this.service.getById(id).subscribe({ next: (fila) => { this.filas.set([fila]); this.avisar(''); this.cargando.set(false); }, error: (e: HttpErrorResponse) => this.fallo(e, false) }); }
  limpiarFiltro(): void { this.idFiltro = ''; this.cargarTodos(); }
  abrirCrear(): void { this.modo.set('crear'); this.idEditando = ''; this.formulario = this.vacio(); this.popupAbierto.set(true); }
  abrirEditar(fila: Grupo): void { this.modo.set('editar'); this.idEditando = String(fila.id_grupo); this.formulario = { id_curso: fila.id_curso, id_profesor: fila.id_profesor, id_periodo: fila.id_periodo, cupo: fila.cupo }; this.popupAbierto.set(true); }
  cerrarPopup(): void { this.popupAbierto.set(false); }
  guardar(): void {
    if (!this.formulario.id_curso || !this.formulario.id_profesor || !this.formulario.id_periodo || !this.formulario.cupo) { this.avisar('Completa curso, profesor, periodo y cupo.', true); return; } this.cargando.set(true);
    const peticion = this.modo() === 'crear' ? this.service.create(this.formulario) : this.service.update(this.idEditando, this.formulario);
    peticion.subscribe({ next: () => { this.popupAbierto.set(false); this.avisar(this.modo() === 'crear' ? 'Grupo creado' : 'Grupo actualizado'); this.refrescar(); }, error: (e: HttpErrorResponse) => this.fallo(e, false) });
  }
  eliminar(fila: Grupo): void { if (!confirm(`Eliminar el grupo ${fila.id_grupo}?`)) return; this.cargando.set(true); this.service.delete(fila.id_grupo).subscribe({ next: () => { this.avisar('Grupo eliminado'); this.refrescar(); }, error: (e: HttpErrorResponse) => this.fallo(e, false) }); }
  private cargarTodos(): void { this.cargando.set(true); this.service.getAll().subscribe({ next: (filas) => { this.filas.set(filas ?? []); this.avisar(filas?.length ? '' : 'No hay registros'); this.cargando.set(false); }, error: (e: HttpErrorResponse) => this.fallo(e, true) }); }
  private refrescar(): void { this.idFiltro.trim() ? this.buscarPorId() : this.cargarTodos(); }
  private vacio(): GrupoInput { return { id_curso: 0, id_profesor: 0, id_periodo: 0, cupo: 0 }; }
  private avisar(texto: string, error = false): void { this.mensaje.set(texto); this.esError.set(error && !!texto); }
  private fallo(e: HttpErrorResponse, alListar: boolean): void { this.filas.set(alListar ? [] : this.filas()); this.avisar(e.status === 0 ? 'No se pudo conectar con la API.' : e.status === 404 ? (alListar ? 'No hay registros' : 'No encontrado') : 'No se pudo completar la operacion', e.status !== 404 || !alListar); this.cargando.set(false); }
}
