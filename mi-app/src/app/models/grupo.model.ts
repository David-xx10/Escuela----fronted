export interface Grupo {
  id_grupo: number;
  id_curso: number;
  id_profesor: number;
  id_periodo: number;
  cupo: number;
}

export type GrupoInput = Omit<Grupo, 'id_grupo'>;
