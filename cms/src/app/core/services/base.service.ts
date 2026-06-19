import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API } from './auth.service';

export abstract class BaseService<T> {
  protected abstract endpoint: string;

  constructor(protected http: HttpClient) {}

  getAll(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<any>(`${API}/${this.endpoint}`, { params: httpParams }).pipe(
      map(res => res.data ?? res)
    );
  }

  getOne(id: string): Observable<T> {
    return this.http.get<any>(`${API}/${this.endpoint}/${id}`).pipe(
      map(res => res.data ?? res)
    );
  }

  create(data: any): Observable<T> {
    return this.http.post<any>(`${API}/${this.endpoint}`, data).pipe(
      map(res => res.data ?? res)
    );
  }

  update(id: string, data: any): Observable<T> {
    return this.http.patch<any>(`${API}/${this.endpoint}/${id}`, data).pipe(
      map(res => res.data ?? res)
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${API}/${this.endpoint}/${id}`).pipe(
      map(res => res.data ?? res)
    );
  }
}
