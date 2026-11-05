export interface Nota {
  id_nota: number;
  id_estudiante: number;
  id_evaluacion: number;
  valor: number;
}

export type NotaUpdate = Omit<Nota, 'id_nota'>;