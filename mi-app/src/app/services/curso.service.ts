import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environments';
import { Curso, CursoInput } from '../models/curso.model';

@Injectable({ providedIn: 'root' })
export class CursoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/cursos/`;

  getAll(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.baseUrl);
  }

  getById(id: string | number): Observable<Curso> {
    return this.http.get<Curso>(`${this.baseUrl}${id}`);
  }

  create(data: CursoInput): Observable<Curso> {
    return this.http.post<Curso>(this.baseUrl, data);
  }

  update(id: string | number, data: Partial<CursoInput>): Observable<Curso> {
    return this.http.put<Curso>(`${this.baseUrl}${id}`, data);
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}`);
  }
}
