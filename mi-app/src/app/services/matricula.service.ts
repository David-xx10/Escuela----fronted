import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environments';
import { Matricula, MatriculaCreate, MatriculaUpdate } from '../models/matricula.model';

@Injectable({
  providedIn: 'root',
})
export class MatriculaService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/matriculas`;

  listar(): Observable<Matricula[]> {
    return this.http.get<Matricula[]>(this.baseUrl);
  }

  obtener(id: string | number): Observable<Matricula> {
    return this.http.get<Matricula>(`${this.baseUrl}/${id}`);
  }

  crear(data: MatriculaCreate): Observable<Matricula> {
    return this.http.post<Matricula>(this.baseUrl, data);
  }

  actualizar(id: string | number, data: MatriculaUpdate): Observable<Matricula> {
    return this.http.put<Matricula>(`${this.baseUrl}/${id}`, data);
  }

  eliminar(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
