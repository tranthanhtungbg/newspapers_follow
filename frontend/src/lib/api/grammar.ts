import api from '../api';

export interface GrammarLessonProgress {
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  score: number | null;
}

export interface GrammarLesson {
  id: string;
  topicId: string;
  title: string;
  content: string;
  exercises: any;
  order: number;
  progress?: GrammarLessonProgress | null;
}

export interface GrammarTopic {
  id: string;
  title: string;
  description: string | null;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  order: number;
  lessons: {
    id: string;
    title: string;
    order: number;
    isCompleted: boolean;
    score: number | null;
  }[];
}

export const grammarApi = {
  getRoadmap: async (): Promise<GrammarTopic[]> => {
    const response = await api.get('/grammar/roadmap');
    return response.data.data;
  },

  getLesson: async (id: string): Promise<GrammarLesson> => {
    const response = await api.get(`/grammar/lessons/${id}`);
    return response.data.data;
  },

  markCompleted: async (id: string, score: number): Promise<void> => {
    await api.post(`/grammar/lessons/${id}/complete`, { score });
  },
};
