export interface Evaluacion {
  id_evaluacion: number;
  id_estudiante: number;
  id_curso?: number | null;
  id_grupo?: number | null;
  tipo_evaluacion: string;
  nota: number | string;
  fecha_evaluacion: string;
}

export type EvaluacionCreate = {
  id_estudiante: number | string;
  id_curso?: number | string | null;
  id_grupo?: number | string | null;
  tipo_evaluacion: string;
  nota: number | string;
  fecha_evaluacion: string;
};

export type EvaluacionUpdate = Partial<EvaluacionCreate>;
