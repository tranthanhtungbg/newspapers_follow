import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { BaseService } from './base.service';
import { API } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseService<any> {
  protected override endpoint = 'admin/users';

  constructor(http: HttpClient) {
    super(http);
  }

  getUsers(params?: any) {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<any>(`${API}/admin/users`, { params: httpParams });
  }

  getUserProgress(userId: string) { 
    return this.http.get<any>(`${API}/admin/users/${userId}/progress`).pipe(
      map(res => res.data ?? res)
    ); 
  }
}
