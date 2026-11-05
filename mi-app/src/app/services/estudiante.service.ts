import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { Estudiante, EstudianteUpdate } from '../models/estudiante.model';

@Injectable({ providedIn: 'root' })
export class EstudianteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/estudiantes`;

  listar(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(`${this.base}/`);
  }

  obtener(id: number): Observable<Estudiante> {
    return this.http.get<Estudiante>(`${this.base}/${id}`);
  }

  crear(datos: Estudiante): Observable<Estudiante> {
    return this.http.post<Estudiante>(`${this.base}/`, datos);
  }

  actualizar(id: number, datos: EstudianteUpdate): Observable<Estudiante> {
    return this.http.put<Estudiante>(`${this.base}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}