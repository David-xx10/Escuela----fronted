export interface Evaluacion {
  id_evaluacion: number;
  id_estudiante?: number | string | null;
  id_curso?: number | string | null;
  id_grupo?: number | string | null;
  tipo_evaluacion?: string;
  nota?: number | string;
  fecha_evaluacion?: string;
  nombre?: string;
  descripcion?: string;
  tipo?: string;
  fecha?: string;
  valor_maximo?: number | string;
}

export type EvaluacionCreate = {
  id_estudiante?: number | string;
  id_curso?: number | string | null;
  id_grupo?: number | string | null;
  tipo_evaluacion?: string;
  nota?: number | string;
  fecha_evaluacion?: string;
  nombre?: string;
  descripcion?: string;
  tipo?: string;
  fecha?: string;
  valor_maximo?: number | string;
};

export type EvaluacionUpdate = Partial<EvaluacionCreate>;
