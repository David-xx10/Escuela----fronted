export interface Matricula {
  id_matricula: number;
  id_estudiante: number;
  id_curso?: number | null;
  id_grupo?: number | null;
  fecha_matricula: string;
}

export type MatriculaCreate = {
  id_estudiante: number | string;
  id_curso?: number | string | null;
  id_grupo?: number | string | null;
  fecha_matricula: string;
};

export type MatriculaUpdate = Partial<MatriculaCreate>;