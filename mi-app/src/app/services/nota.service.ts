import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { Nota, NotaUpdate } from '../models/nota.model';

@Injectable({ providedIn: 'root' })
export class NotaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/notas`;

  listar(): Observable<Nota[]> {
    return this.http.get<Nota[]>(`${this.base}/`);
  }

  obtener(id: number): Observable<Nota> {
    return this.http.get<Nota>(`${this.base}/${id}`);
  }

  crear(datos: Nota): Observable<Nota> {
    return this.http.post<Nota>(`${this.base}/`, datos);
  }

  actualizar(id: number, datos: NotaUpdate): Observable<Nota> {
    return this.http.put<Nota>(`${this.base}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}