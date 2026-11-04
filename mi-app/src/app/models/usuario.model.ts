export interface Usuario {
  id_usuario: string;
  primer_nombre: string;
  segundo_nombre?: string | null;
  primer_apellido: string;
  segundo_apellido?: string | null;
  nombre_usuario: string;
}

export type UsuarioCreate = {
  primer_nombre: string;
  segundo_nombre?: string | null;
  primer_apellido: string;
  segundo_apellido?: string | null;
  nombre_usuario: string;
  clave: string;
};

export type UsuarioUpdate = {
  primer_nombre?: string;
  segundo_nombre?: string | null;
  primer_apellido?: string;
  segundo_apellido?: string | null;
  nombre_usuario?: string;
  clave?: string;
};
