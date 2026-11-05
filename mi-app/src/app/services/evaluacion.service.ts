import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Evaluacion,
  EvaluacionCreate,
  EvaluacionUpdate,
} from '../models/evaluacion.model';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class EvaluacionService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/evaluaciones`;

  listar(): Observable<Evaluacion[]> {
    return this.http.get<Evaluacion[]>(this.baseUrl);
  }

  obtener(id: string | number): Observable<Evaluacion> {
    return this.http.get<Evaluacion>(`${this.baseUrl}/${id}`);
  }

  crear(data: EvaluacionCreate): Observable<Evaluacion> {
    return this.http.post<Evaluacion>(this.baseUrl, data);
  }

  actualizar(id: string | number, data: EvaluacionUpdate): Observable<Evaluacion> {
    return this.http.put<Evaluacion>(`${this.baseUrl}/${id}`, data);
  }

  eliminar(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
