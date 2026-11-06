import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environments';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  listar(): Observable<{ data?: Usuario[] }> {
    return this.http.get<{ data?: Usuario[] }>(this.baseUrl);
  }

  obtener(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  crear(data: UsuarioCreate): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, data);
  }

  actualizar(id: string, data: UsuarioUpdate): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, data);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
