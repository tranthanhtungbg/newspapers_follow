import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { vi_VN, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { provideNzIcons } from 'ng-zorro-antd/icon';
import { 
  DashboardOutline, 
  BookOutline, 
  TeamOutline, 
  MenuFoldOutline, 
  MenuUnfoldOutline, 
  LogoutOutline, 
  UserOutline, 
  PlusOutline, 
  EditOutline, 
  DeleteOutline, 
  EyeOutline, 
  EyeInvisibleOutline, 
  MailOutline, 
  LockOutline, 
  BarChartOutline, 
  SearchOutline, 
  DownOutline,
  KeyOutline,
  UserAddOutline,
  ReadOutline,
  YoutubeOutline,
  ProfileOutline
} from '@ant-design/icons-angular/icons';

const icons = [ 
  DashboardOutline, 
  BookOutline, 
  TeamOutline, 
  MenuFoldOutline, 
  MenuUnfoldOutline, 
  LogoutOutline, 
  UserOutline, 
  PlusOutline, 
  EditOutline, 
  DeleteOutline, 
  EyeOutline, 
  EyeInvisibleOutline, 
  MailOutline, 
  LockOutline, 
  BarChartOutline, 
  SearchOutline, 
  DownOutline,
  KeyOutline,
  UserAddOutline,
  ReadOutline,
  YoutubeOutline,
  ProfileOutline
];

registerLocaleData(vi);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideNzI18n(vi_VN),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideNzIcons(icons)
  ]
};
