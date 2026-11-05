export interface PeriodoAcademico {
  id_periodo_academico: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

export type PeriodoAcademicoCreate = {
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
};

export type PeriodoAcademicoUpdate = Partial<PeriodoAcademicoCreate>;
