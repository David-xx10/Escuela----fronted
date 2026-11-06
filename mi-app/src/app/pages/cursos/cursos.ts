import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Curso, CursoInput } from '../../models/curso.model';
import { CursoService } from '../../services/curso.service';

type ModoPopup = 'crear' | 'editar';

@Component({ selector: 'app-cursos', imports: [FormsModule], templateUrl: './cursos.html', styleUrl: './cursos.css' })
export class Cursos implements OnInit {
  private readonly service = inject(CursoService);
  readonly filas = signal<Curso[]>([]); readonly mensaje = signal(''); readonly esError = signal(false);
  readonly cargando = signal(false); readonly popupAbierto = signal(false); readonly modo = signal<ModoPopup>('crear');
  idFiltro = ''; formulario: CursoInput = this.vacio(); private idEditando = '';
  ngOnInit(): void { this.cargarTodos(); }
  buscarPorId(): void {
    const id = this.idFiltro.trim(); if (!id) { this.cargarTodos(); return; } this.cargando.set(true);
    this.service.getById(id).subscribe({ next: (fila) => { this.filas.set([fila]); this.avisar(''); this.cargando.set(false); }, error: (e: HttpErrorResponse) => this.fallo(e, false) });
  }
  limpiarFiltro(): void { this.idFiltro = ''; this.cargarTodos(); }
  abrirCrear(): void { this.modo.set('crear'); this.idEditando = ''; this.formulario = this.vacio(); this.popupAbierto.set(true); }
  abrirEditar(fila: Curso): void { this.modo.set('editar'); this.idEditando = String(fila.id_curso); this.formulario = { nombre: fila.nombre, creditos: fila.creditos, id_facultad: fila.id_facultad }; this.popupAbierto.set(true); }
  cerrarPopup(): void { this.popupAbierto.set(false); }
  guardar(): void {
    if (!this.formulario.nombre.trim() || !this.formulario.creditos || !this.formulario.id_facultad) { this.avisar('Completa nombre, créditos y facultad.', true); return; }
    this.cargando.set(true);
    const peticion = this.modo() === 'crear' ? this.service.create(this.formulario) : this.service.update(this.idEditando, this.formulario);
    peticion.subscribe({ next: () => { this.popupAbierto.set(false); this.avisar(this.modo() === 'crear' ? 'Curso creado' : 'Curso actualizado'); this.refrescar(); }, error: (e: HttpErrorResponse) => this.fallo(e, false) });
  }
  eliminar(fila: Curso): void {
    if (!confirm(`Eliminar el curso ${fila.id_curso}?`)) return; this.cargando.set(true);
    this.service.delete(fila.id_curso).subscribe({ next: () => { this.avisar('Curso eliminado'); this.refrescar(); }, error: (e: HttpErrorResponse) => this.fallo(e, false) });
  }
  private cargarTodos(): void {
    this.cargando.set(true); this.service.getAll().subscribe({ next: (filas) => { this.filas.set(filas ?? []); this.avisar(filas?.length ? '' : 'No hay registros'); this.cargando.set(false); }, error: (e: HttpErrorResponse) => this.fallo(e, true) });
  }
  private refrescar(): void { this.idFiltro.trim() ? this.buscarPorId() : this.cargarTodos(); }
  private vacio(): CursoInput { return { nombre: '', creditos: 0, id_facultad: 0 }; }
  private avisar(texto: string, error = false): void { this.mensaje.set(texto); this.esError.set(error && !!texto); }
  private fallo(e: HttpErrorResponse, alListar: boolean): void { this.filas.set(alListar ? [] : this.filas()); this.avisar(e.status === 0 ? 'No se pudo conectar con la API.' : e.status === 404 ? (alListar ? 'No hay registros' : 'No encontrado') : 'No se pudo completar la operacion', e.status !== 404 || !alListar); this.cargando.set(false); }
}
