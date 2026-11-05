import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Profesor } from '../../models/profesor.model';
import { ProfesorService } from '../../services/profesor.service';

@Component({
  selector: 'app-profesores',
  imports: [FormsModule],
  templateUrl: './profesores.html',
  styleUrl: './profesores.css',
})
export class Profesores implements OnInit {
  private readonly servicio = inject(ProfesorService);

  filas = signal<Profesor[]>([]);
  mensaje = signal('');
  esError = signal(false);
  cargando = signal(false);
  popupAbierto = signal(false);
  modo = signal<'crear' | 'editar'>('crear');
  idFiltro = '';

  formulario: {
    id_profesor: number | null;
    nombre: string;
    apellido: string;
    correo: string;
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
      next: (profesor) => {
        this.filas.set([profesor]);
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

  abrirEditar(fila: Profesor): void {
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
    const { id_profesor, ...resto } = this.formulario;
    if (id_profesor === null) {
      this.avisar('El ID del profesor es obligatorio.', true);
      return;
    }

    this.cargando.set(true);
    const peticion =
      this.modo() === 'crear'
        ? this.servicio.crear({ id_profesor, ...resto })
        : this.servicio.actualizar(id_profesor, resto);

    peticion.subscribe({
      next: () => {
        this.cargando.set(false);
        this.cerrarPopup();
        this.listar();
      },
      error: (err) => this.fallo(err),
    });
  }

  eliminar(fila: Profesor): void {
    if (!confirm('¿Eliminar este profesor?')) return;
    this.cargando.set(true);
    this.servicio.eliminar(fila.id_profesor).subscribe({
      next: () => {
        this.cargando.set(false);
        this.listar();
      },
      error: (err) => this.fallo(err),
    });
  }

  private vacio() {
    return { id_profesor: null as number | null, nombre: '', apellido: '', correo: '' };
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
        this.avisar('El servidor rechazó la operación: el ID ya existe o el profesor está asignado a un grupo.', true);
        break;
      case 0:
        this.avisar('No se pudo conectar con la API. ¿Está corriendo el backend?', true);
        break;
      default:
        this.avisar('Ocurrió un error inesperado.', true);
    }
  }
}
