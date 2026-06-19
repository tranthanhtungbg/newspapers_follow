import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { HttpClient } from '@angular/common/http';
import { API } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NzStatisticModule, NzCardModule, NzGridModule, NzIconModule, NzTagModule],
  template: `
    <div class="page-header">
      <h2>📊 Dashboard</h2>
      <p>Tổng quan hệ thống LingoReader</p>
    </div>

    <div nz-row [nzGutter]="[16, 16]">
      <div nz-col [nzXs]="24" [nzSm]="12" [nzLg]="6">
        <nz-card class="stat-card stat-blue">
          <div class="stat-icon">👥</div>
          <nz-statistic [nzValue]="stats.users" nzTitle="Tổng người dùng"></nz-statistic>
        </nz-card>
      </div>
      <div nz-col [nzXs]="24" [nzSm]="12" [nzLg]="6">
        <nz-card class="stat-card stat-green">
          <div class="stat-icon">📚</div>
          <nz-statistic [nzValue]="stats.topics" nzTitle="Chủ đề Grammar"></nz-statistic>
        </nz-card>
      </div>
      <div nz-col [nzXs]="24" [nzSm]="12" [nzLg]="6">
        <nz-card class="stat-card stat-purple">
          <div class="stat-icon">📝</div>
          <nz-statistic [nzValue]="stats.lessons" nzTitle="Bài học"></nz-statistic>
        </nz-card>
      </div>
      <div nz-col [nzXs]="24" [nzSm]="12" [nzLg]="6">
        <nz-card class="stat-card stat-orange">
          <div class="stat-icon">🔤</div>
          <nz-statistic [nzValue]="stats.vocab" nzTitle="Từ vựng đã học"></nz-statistic>
        </nz-card>
      </div>
    </div>

    <div nz-row [nzGutter]="[16, 16]" style="margin-top:16px">
      <div nz-col [nzSpan]="24">
        <nz-card nzTitle="🧭 Truy cập nhanh">
          <div class="quick-links">
            <a [routerLink]="['/grammar']" class="quick-link">
              <div class="ql-icon">📚</div>
              <div>
                <div class="ql-title">Quản lý Grammar</div>
                <div class="ql-desc">Thêm/Sửa/Xóa chủ đề và bài học</div>
              </div>
            </a>
            <a [routerLink]="['/users']" class="quick-link">
              <div class="ql-icon">👥</div>
              <div>
                <div class="ql-title">Người dùng</div>
                <div class="ql-desc">Xem tiến độ học tập theo người dùng</div>
              </div>
            </a>
          </div>
        </nz-card>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h2 { font-size: 22px; font-weight: 800; margin: 0; }
    .page-header p { color: #888; margin: 4px 0 0; }
    .stat-card { border-radius: 12px; border: none; position: relative; overflow: hidden; }
    .stat-card::before {
      content: ''; position: absolute; right: -20px; top: -20px;
      width: 100px; height: 100px; border-radius: 50%; opacity: 0.08;
    }
    .stat-blue::before  { background: #4096ff; }
    .stat-green::before { background: #52c41a; }
    .stat-purple::before{ background: #9254de; }
    .stat-orange::before{ background: #fa8c16; }
    .stat-icon { font-size: 32px; margin-bottom: 8px; }
    .quick-links { display: flex; gap: 16px; flex-wrap: wrap; }
    .quick-link {
      display: flex; align-items: center; gap: 16px; padding: 16px 24px;
      border: 2px solid #f0f0f0; border-radius: 12px; flex: 1; min-width: 240px;
      cursor: pointer; transition: all 0.2s; text-decoration: none; color: inherit;
    }
    .quick-link:hover { border-color: #667eea; box-shadow: 0 4px 16px rgba(102,126,234,0.15); }
    .ql-icon { font-size: 36px; }
    .ql-title { font-size: 15px; font-weight: 700; color: #333; }
    .ql-desc { font-size: 13px; color: #888; margin-top: 2px; }
  `]
})
export class DashboardComponent implements OnInit {
  stats = { users: 0, topics: 0, lessons: 0, vocab: 0 };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${API}/admin/users`).subscribe(res => {
      const data = res?.data ?? res;
      this.stats.users = data?.meta?.total ?? res?.meta?.total ?? 0;
    });
    this.http.get<any>(`${API}/grammar/admin/topics`).subscribe(res => {
      const topics = res?.data ?? res ?? [];
      this.stats.topics = topics.length;
      this.stats.lessons = topics.reduce((s: number, t: any) => s + (t._count?.lessons ?? 0), 0);
    });
  }
}
