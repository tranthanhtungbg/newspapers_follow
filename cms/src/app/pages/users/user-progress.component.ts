import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-user-progress',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzStatisticModule, NzTagModule, NzTableModule, NzProgressModule, NzSpinModule, NzGridModule, NzAvatarModule, NzBreadCrumbModule, NzIconModule],
  template: `
    <nz-breadcrumb style="margin-bottom:16px">
      <nz-breadcrumb-item><a routerLink="/users">Người dùng</a></nz-breadcrumb-item>
      <nz-breadcrumb-item>{{ data?.user?.name }}</nz-breadcrumb-item>
    </nz-breadcrumb>

    <nz-spin [nzSpinning]="loading">
      <div *ngIf="data">
        <!-- User Info Card -->
        <nz-card [nzBordered]="false" style="border-radius:12px;margin-bottom:16px">
          <div class="user-info">
            <nz-avatar [nzText]="data.user.name?.[0]?.toUpperCase()" nzSize="large" style="background:#667eea"></nz-avatar>
            <div>
              <h3>{{ data.user.name }}</h3>
              <span>{{ data.user.email }}</span>
              <nz-tag [nzColor]="data.user.role === 'ADMIN' ? 'purple' : 'blue'" style="margin-left:8px">{{ data.user.role }}</nz-tag>
            </div>
            <div class="streak">🔥 {{ data.user.streakCount }} ngày streak</div>
          </div>
        </nz-card>

        <!-- Stats -->
        <div nz-row [nzGutter]="[16,16]" style="margin-bottom:16px">
          <div nz-col [nzSpan]="6">
            <nz-card [nzBordered]="false" style="border-radius:12px">
              <nz-statistic [nzValue]="data.grammarProgress.length" nzTitle="🎯 Bài học đã học" [nzValueStyle]="{color: '#667eea'}"></nz-statistic>
            </nz-card>
          </div>
          <div nz-col [nzSpan]="6">
            <nz-card [nzBordered]="false" style="border-radius:12px">
              <nz-statistic [nzValue]="completedLessons" nzTitle="✅ Bài đã hoàn thành" [nzValueStyle]="{color: '#52c41a'}"></nz-statistic>
            </nz-card>
          </div>
          <div nz-col [nzSpan]="6">
            <nz-card [nzBordered]="false" style="border-radius:12px">
              <nz-statistic [nzValue]="avgScore" nzTitle="📊 Điểm TB" [nzValueStyle]="{color: '#fa8c16'}" [nzSuffix]="'/100'"></nz-statistic>
            </nz-card>
          </div>
          <div nz-col [nzSpan]="6">
            <nz-card [nzBordered]="false" style="border-radius:12px">
              <nz-statistic [nzValue]="data.vocabularyCount" nzTitle="🔤 Từ vựng đã lưu" [nzValueStyle]="{color: '#9254de'}"></nz-statistic>
            </nz-card>
          </div>
        </div>

        <!-- Grammar Progress Table -->
        <nz-card nzTitle="📚 Tiến độ Grammar" [nzBordered]="false" style="border-radius:12px">
          <nz-table [nzData]="data.grammarProgress" nzSize="small" [nzPageSize]="20">
            <thead>
              <tr>
                <th>Bài học</th>
                <th>Trạng thái</th>
                <th nzWidth="120px">Điểm</th>
                <th>Học lần cuối</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of data.grammarProgress">
                <td>{{ p.lesson?.title }}</td>
                <td>
                  <nz-tag [nzColor]="p.isCompleted ? 'green' : 'default'">
                    {{ p.isCompleted ? '✅ Hoàn thành' : '⏳ Đang học' }}
                  </nz-tag>
                </td>
                <td>
                  <nz-progress *ngIf="p.score !== null" [nzPercent]="p.score" nzSize="small"></nz-progress>
                  <span *ngIf="p.score === null" style="color:#bbb">—</span>
                </td>
                <td>{{ p.lastStudied | date:'dd/MM/yyyy HH:mm' }}</td>
              </tr>
            </tbody>
          </nz-table>
        </nz-card>
      </div>
    </nz-spin>
  `,
  styles: [`
    h3 { font-size: 18px; font-weight: 700; margin: 0; }
    .user-info { display: flex; align-items: center; gap: 16px; }
    .user-info > div { flex: 1; }
    .streak { font-size: 20px; font-weight: 700; }
  `]
})
export class UserProgressComponent implements OnInit {
  data: any = null;
  loading = false;

  get completedLessons() { return this.data?.grammarProgress?.filter((p: any) => p.isCompleted).length ?? 0; }
  get avgScore() {
    const withScore = this.data?.grammarProgress?.filter((p: any) => p.score !== null) ?? [];
    if (!withScore.length) return 0;
    return Math.round(withScore.reduce((s: number, p: any) => s + p.score, 0) / withScore.length);
  }

  constructor(private route: ActivatedRoute, private svc: UserService) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loading = true;
    this.svc.getUserProgress(id).subscribe({
      next: res => { this.data = res; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
