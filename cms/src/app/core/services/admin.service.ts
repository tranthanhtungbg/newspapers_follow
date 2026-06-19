import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  private getHttpParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return httpParams;
  }

  getArticles(params?: any): Observable<any> {
    return this.http.get<any>(`${API}/admin/articles`, { params: this.getHttpParams(params) });
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete<any>(`${API}/admin/articles/${id}`);
  }

  preFetchArticle(url: string): Observable<any> {
    return this.http.post<any>(`${API}/admin/articles/pre-fetch`, { url });
  }

  getYoutubeVideos(params?: any): Observable<any> {
    return this.http.get<any>(`${API}/admin/youtube`, { params: this.getHttpParams(params) });
  }

  deleteYoutubeVideo(videoId: string, targetLang: string): Observable<any> {
    return this.http.delete<any>(`${API}/admin/youtube/${videoId}/${targetLang}`);
  }

  updateYoutubeVideo(videoId: string, targetLang: string, title: string, subtitles: any): Observable<any> {
    return this.http.patch<any>(`${API}/admin/youtube/${videoId}/${targetLang}`, { title, subtitles });
  }

  createUser(data: any): Observable<any> {
    return this.http.post<any>(`${API}/admin/users`, data);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${API}/admin/users/${id}`);
  }

  getGlobalVocabulary(params?: any): Observable<any> {
    return this.http.get<any>(`${API}/admin/vocabulary`, { params: this.getHttpParams(params) });
  }

  createVocabulary(data: any): Observable<any> {
    return this.http.post<any>(`${API}/admin/vocabulary`, data);
  }

  deleteVocabulary(id: string): Observable<any> {
    return this.http.delete<any>(`${API}/admin/vocabulary/${id}`);
  }

  changePassword(data: any): Observable<any> {
    return this.http.post<any>(`${API}/admin/change-password`, data);
  }

  resetUserPassword(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`${API}/admin/users/${id}/reset-password`, data);
  }
}
