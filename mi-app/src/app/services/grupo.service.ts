import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environments';
import { Grupo, GrupoInput } from '../models/grupo.model';

@Injectable({ providedIn: 'root' })
export class GrupoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/grupos/`;

  getAll(): Observable<Grupo[]> {
    return this.http.get<Grupo[]>(this.baseUrl);
  }

  getById(id: string | number): Observable<Grupo> {
    return this.http.get<Grupo>(`${this.baseUrl}${id}`);
  }

  create(data: GrupoInput): Observable<Grupo> {
    return this.http.post<Grupo>(this.baseUrl, data);
  }

  update(id: string | number, data: Partial<GrupoInput>): Observable<Grupo> {
    return this.http.put<Grupo>(`${this.baseUrl}${id}`, data);
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}`);
  }
}
