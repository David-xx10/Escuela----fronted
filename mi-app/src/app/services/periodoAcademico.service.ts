import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  PeriodoAcademico,
  PeriodoAcademicoCreate,
  PeriodoAcademicoUpdate,
} from '../models/periodoAcademico.model';

@Injectable({
  providedIn: 'root',
})
export class PeriodoAcademicoService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:8000/periodos-academicos';

  listar(): Observable<PeriodoAcademico[]> {
    return this.http.get<PeriodoAcademico[]>(this.baseUrl);
  }

  obtener(id: string | number): Observable<PeriodoAcademico> {
    return this.http.get<PeriodoAcademico>(`${this.baseUrl}/${id}`);
  }

  crear(data: PeriodoAcademicoCreate): Observable<PeriodoAcademico> {
    return this.http.post<PeriodoAcademico>(this.baseUrl, data);
  }

  actualizar(id: string | number, data: PeriodoAcademicoUpdate): Observable<PeriodoAcademico> {
    return this.http.put<PeriodoAcademico>(`${this.baseUrl}/${id}`, data);
  }

  eliminar(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
