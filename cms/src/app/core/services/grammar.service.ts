import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { API } from './auth.service';

@Injectable({ providedIn: 'root' })
export class GrammarService extends BaseService<any> {
  protected override endpoint = 'grammar/admin/topics';

  constructor(http: HttpClient) {
    super(http);
  }

  getTopics() { return this.getAll(); }

  // Topic specific
  getTopic(id: string) { return this.getOne(id); }
  
  // Lessons
  getLessons(topicId: string) { 
    return this.http.get<any>(`${API}/grammar/admin/topics/${topicId}/lessons`); 
  }
  
  createLesson(topicId: string, data: any) { 
    return this.http.post<any>(`${API}/grammar/admin/topics/${topicId}/lessons`, data); 
  }
  
  updateLesson(id: string, data: any) { 
    return this.http.patch<any>(`${API}/grammar/admin/lessons/${id}`, data); 
  }
  
  deleteLesson(id: string) { 
    return this.http.delete<any>(`${API}/grammar/admin/lessons/${id}`); 
  }
}
