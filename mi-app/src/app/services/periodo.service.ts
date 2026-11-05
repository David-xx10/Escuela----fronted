import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { PeriodoAcademico, PeriodoInput } from '../models/periodo.model';

@Injectable({ providedIn: 'root' })
export class PeriodoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://127.0.0.1:8000/periodos-academicos/';

  getAll(): Observable<PeriodoAcademico[]> {
    return this.http.get<PeriodoAcademico[]>(this.baseUrl);
  }

  getById(id: string | number): Observable<PeriodoAcademico> {
    return this.http.get<PeriodoAcademico>(`${this.baseUrl}${id}`);
  }

  create(data: PeriodoInput): Observable<PeriodoAcademico> {
    return this.http.post<PeriodoAcademico>(this.baseUrl, data);
  }

  update(id: string | number, data: Partial<PeriodoInput>): Observable<PeriodoAcademico> {
    return this.http.put<PeriodoAcademico>(`${this.baseUrl}${id}`, data);
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}`);
  }
}
