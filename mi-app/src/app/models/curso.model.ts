export interface Curso {
  id_curso: number;
  nombre: string;
  creditos: number;
  id_facultad: number;
}

export type CursoInput = Omit<Curso, 'id_curso'>;
