export interface Estudiante {
  id_estudiante: number;
  nombre: string;
  apellido: string;
  correo: string;
}

export type EstudianteUpdate = Omit<Estudiante, 'id_estudiante'>;