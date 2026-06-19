import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';

const API = 'http://localhost:3001/api/v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = new BehaviorSubject<any>(null);
  user$ = this._user.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('cms_token');
    if (token) this.loadMe();
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${API}/auth/login`, { email, password }).pipe(
      tap(res => {
        const data = res.data ?? res;
        const token = data.tokens?.accessToken;
        if (token) localStorage.setItem('cms_token', token);
        this._user.next(data.user);
      })
    );
  }

  loadMe() {
    return this.http.get<any>(`${API}/auth/me`).pipe(
      tap(res => this._user.next(res.data ?? res))
    ).subscribe({ error: () => this.logout() });
  }

  logout() {
    localStorage.removeItem('cms_token');
    this._user.next(null);
    this.router.navigate(['/login']);
  }

  get currentUser() { return this._user.value; }
}

export { API };
