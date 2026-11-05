import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Facultad, FacultadInput } from '../models/facultad.model';

@Injectable({ providedIn: 'root' })
export class FacultadService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://127.0.0.1:8000/facultades/';

  getAll(): Observable<Facultad[]> {
    return this.http.get<Facultad[]>(this.baseUrl);
  }

  getById(id: string | number): Observable<Facultad> {
    return this.http.get<Facultad>(`${this.baseUrl}${id}`);
  }

  create(data: FacultadInput): Observable<Facultad> {
    return this.http.post<Facultad>(this.baseUrl, data);
  }

  update(id: string | number, data: Partial<FacultadInput>): Observable<Facultad> {
    return this.http.put<Facultad>(`${this.baseUrl}${id}`, data);
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}`);
  }
}
