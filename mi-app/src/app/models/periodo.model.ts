export interface PeriodoAcademico {
  id_periodo: number;
  nombre: string;
}

export type PeriodoInput = Omit<PeriodoAcademico, 'id_periodo'>;
