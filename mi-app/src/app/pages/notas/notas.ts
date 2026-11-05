
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Nota } from '../../models/nota.model';
import { NotaService } from '../../services/nota.service';

@Component({
  selector: 'app-notas',
  imports: [FormsModule],
  templateUrl: './notas.html',
  styleUrl: './notas.css',
})
export class Notas implements OnInit {
  private readonly servicio = inject(NotaService);

  filas = signal<Nota[]>([]);
  mensaje = signal('');
  esError = signal(false);
  cargando = signal(false);
  popupAbierto = signal(false);
  modo = signal<'crear' | 'editar'>('crear');
  idFiltro = '';

  formulario: {
    id_nota: number | null;
    id_estudiante: number | null;
    id_evaluacion: number | null;
    valor: number | null;
  } = this.vacio();

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.avisar('');
    this.cargando.set(true);
    this.servicio.listar().subscribe({
      next: (datos) => {
        this.filas.set(datos);
        this.cargando.set(false);
        if (datos.length === 0) this.avisar('No hay registros');
      },
      error: (err) => this.fallo(err),
    });
  }

  buscarPorId(): void {
    const texto = this.idFiltro.trim();
    if (!texto) {
      this.listar();
      return;
    }
    const id = Number(texto);
    if (Number.isNaN(id)) {
      this.avisar('El ID debe ser un número.', true);
      return;
    }
    this.avisar('');
    this.cargando.set(true);
    this.servicio.obtener(id).subscribe({
      next: (nota) => {
        this.filas.set([nota]);
        this.cargando.set(false);
      },
      error: (err) => {
        this.filas.set([]);
        this.fallo(err);
      },
    });
  }

  limpiarFiltro(): void {
    this.idFiltro = '';
    this.listar();
  }

  abrirCrear(): void {
    this.modo.set('crear');
    this.formulario = this.vacio();
    this.avisar('');
    this.popupAbierto.set(true);
  }

  abrirEditar(fila: Nota): void {
    this.modo.set('editar');
    this.formulario = { ...fila };
    this.avisar('');
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void {
    this.popupAbierto.set(false);
    this.avisar('');
  }

  guardar(): void {
    const { id_nota, id_estudiante, id_evaluacion, valor } = this.formulario;
    if (id_nota === null || id_estudiante === null || id_evaluacion === null || valor === null) {
      this.avisar('Completa los cuatro campos.', true);
      return;
    }

    this.cargando.set(true);
    const peticion =
      this.modo() === 'crear'
        ? this.servicio.crear({ id_nota, id_estudiante, id_evaluacion, valor })
        : this.servicio.actualizar(id_nota, { id_estudiante, id_evaluacion, valor });

    peticion.subscribe({
      next: () => {
        this.cargando.set(false);
        this.cerrarPopup();
        this.listar();
      },
      error: (err) => this.fallo(err),
    });
  }

  eliminar(fila: Nota): void {
    if (!confirm('¿Eliminar esta nota?')) return;
    this.cargando.set(true);
    this.servicio.eliminar(fila.id_nota).subscribe({
      next: () => {
        this.cargando.set(false);
        this.listar();
      },
      error: (err) => this.fallo(err),
    });
  }

  private vacio() {
    return {
      id_nota: null as number | null,
      id_estudiante: null as number | null,
      id_evaluacion: null as number | null,
      valor: null as number | null,
    };
  }

  private avisar(texto: string, error = false): void {
    this.mensaje.set(texto);
    this.esError.set(error);
  }

  private fallo(err: { status?: number }): void {
    this.cargando.set(false);
    switch (err?.status) {
      case 404:
        this.avisar('No encontrado', true);
        break;
      case 422:
        this.avisar('Revisa los datos del formulario.', true);
        break;
      case 500:
        this.avisar('El servidor rechazó la operación: el ID ya existe o el estudiante no existe.', true);
        break;
      case 0:
        this.avisar('No se pudo conectar con la API. ¿Está corriendo el backend?', true);
        break;
      default:
        this.avisar('Ocurrió un error inesperado.', true);
    }
  }
}