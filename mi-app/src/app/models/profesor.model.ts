export interface Profesor {
  id_profesor: number;
  nombre: string;
  apellido: string;
  correo: string;
}

export type ProfesorUpdate = Omit<Profesor, 'id_profesor'>;