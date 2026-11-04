import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { Profesor, ProfesorUpdate } from '../models/profesor.model';

@Injectable({ providedIn: 'root' })
export class ProfesorService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/profesores`;

  listar(): Observable<Profesor[]> {
    return this.http.get<Profesor[]>(`${this.base}/`);
  }

  obtener(id: number): Observable<Profesor> {
    return this.http.get<Profesor>(`${this.base}/${id}`);
  }

  crear(datos: Profesor): Observable<Profesor> {
    return this.http.post<Profesor>(`${this.base}/`, datos);
  }

  actualizar(id: number, datos: ProfesorUpdate): Observable<Profesor> {
    return this.http.put<Profesor>(`${this.base}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}