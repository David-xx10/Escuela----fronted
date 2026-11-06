export interface Facultad {
  id_facultad: number;
  nombre: string;
}

export type FacultadInput = Omit<Facultad, 'id_facultad'>;
