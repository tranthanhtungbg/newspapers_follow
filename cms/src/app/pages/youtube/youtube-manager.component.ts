import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-youtube-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzCardModule,
    NzInputModule,
    NzIconModule,
    NzModalModule,
    NzSpinModule,
    NzTagModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h2>📺 Quản lý Phụ đề & Video YouTube (Cache)</h2>
        <p>Xem danh sách video đã được lưu phụ đề dịch, chỉnh sửa bản dịch từng câu hoặc xóa cache.</p>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <nz-card [nzBordered]="false" style="border-radius:12px; margin-bottom: 24px;">
      <div class="search-box">
        <nz-input-group [nzPrefix]="searchIcon">
          <input nz-input [(ngModel)]="search" placeholder="Tìm kiếm tiêu đề, videoId..." (keyup.enter)="load()" style="width:360px" />
        </nz-input-group>
        <ng-template #searchIcon><span nz-icon nzType="search"></span></ng-template>
        <button nz-button nzType="primary" (click)="load()">Tìm kiếm</button>
      </div>
    </nz-card>

    <!-- Table -->
    <nz-card [nzBordered]="false" style="border-radius:12px">
      <nz-table #table [nzData]="videos" [nzLoading]="loading" nzSize="middle"
        [nzTotal]="total" [(nzPageIndex)]="page" [nzPageSize]="20" (nzPageIndexChange)="load()" [nzFrontPagination]="false">
        <thead>
          <tr>
            <th nzWidth="40%">Tiêu đề Video</th>
            <th nzWidth="20%">Video ID</th>
            <th nzWidth="15%">Ngôn ngữ dịch</th>
            <th nzWidth="15%">Ngày tạo</th>
            <th nzWidth="10%">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let v of table.data">
            <td>
              <div class="title-cell" (click)="openEditor(v)">
                <span nz-icon nzType="youtube" style="color: #ff0000; font-size:18px;"></span>
                <strong class="clickable-title">{{ v.title || 'Không có tiêu đề' }}</strong>
              </div>
            </td>
            <td>
              <a [href]="'https://youtube.com/watch?v=' + v.videoId" target="_blank" class="youtube-link">
                <code>{{ v.videoId }}</code> <span nz-icon nzType="export" style="font-size:11px"></span>
              </a>
            </td>
            <td>
              <nz-tag nzColor="blue">{{ v.targetLang | uppercase }}</nz-tag>
            </td>
            <td>{{ v.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
            <td>
              <div style="display:flex; gap:8px">
                <button nz-button nzType="link" nzSize="small" (click)="openEditor(v)">
                  Sửa phụ đề
                </button>
                <button nz-button nzType="text" nzDanger nzSize="small" (click)="deleteVideo(v.videoId, v.targetLang)">
                  Xóa
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-card>

    <!-- Subtitle Editor Modal -->
    <nz-modal [(nzVisible)]="isModalVisible" [nzTitle]="'Biên tập phụ đề: ' + editingVideo?.title"
      [nzWidth]="1000" [nzOkText]="'Lưu thay đổi'" [nzCancelText]="'Hủy'"
      [nzOkLoading]="saving" (nzOnOk)="saveSubtitles()" (nzOnCancel)="isModalVisible = false">
      <ng-container *nzModalContent>
        <div style="max-height: 600px; overflow-y: auto; padding-right: 8px;">
          <p style="margin-bottom: 16px;">
            <strong>Mẹo:</strong> Bạn có thể sửa trực tiếp bản dịch tiếng Việt của mỗi câu dưới đây để đồng bộ với phía ứng dụng của người học.
          </p>

          <nz-table [nzData]="subtitles" nzSize="small" [nzFrontPagination]="true" [nzPageSize]="50">
            <thead>
              <tr>
                <th nzWidth="10%">Thời gian</th>
                <th nzWidth="45%">Phụ đề gốc (EN)</th>
                <th nzWidth="45%">Bản dịch (VI)</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sub of subtitles">
                <td>
                  <span nz-icon nzType="clock-circle" style="margin-right:4px; color:#999"></span>
                  <code>{{ formatTime(sub.start) }}</code>
                </td>
                <td><div style="word-break: break-word">{{ sub.text }}</div></td>
                <td>
                  <textarea nz-input [(ngModel)]="sub.translation" nzAutosize placeholder="Chưa dịch..."></textarea>
                </td>
              </tr>
            </tbody>
          </nz-table>
        </div>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h2 { font-size: 22px; font-weight: 800; margin: 0; }
    .page-header p { color: #888; margin: 4px 0 0; }
    .search-box { display: flex; gap: 12px; align-items: center; }
    .title-cell { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .clickable-title:hover { color: #667eea; text-decoration: underline; }
    .youtube-link { color: #595959; font-size: 13px; }
    .youtube-link:hover { color: #ff0000; }
    textarea.nz-input { border-radius: 4px; padding: 4px 8px; font-size:13px; }
  `]
})
export class YoutubeManagerComponent implements OnInit {
  videos: any[] = [];
  loading = false;
  search = '';
  page = 1;
  total = 0;

  isModalVisible = false;
  editingVideo: any = null;
  subtitles: any[] = [];
  saving = false;

  constructor(private adminSvc: AdminService, private msg: NzMessageService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.adminSvc.getYoutubeVideos({ page: this.page, limit: 20, search: this.search }).subscribe({
      next: res => {
        this.videos = res?.data ?? [];
        this.total = res?.meta?.total ?? 0;
        this.loading = false;
      },
      error: () => {
        this.msg.error('Lỗi khi tải danh sách video');
        this.loading = false;
      }
    });
  }

  deleteVideo(videoId: string, targetLang: string) {
    this.adminSvc.deleteYoutubeVideo(videoId, targetLang).subscribe({
      next: () => {
        this.msg.success('Xóa cache phụ đề video thành công');
        this.load();
      },
      error: () => this.msg.error('Lỗi khi xóa video')
    });
  }

  openEditor(video: any) {
    this.editingVideo = video;
    // Deep clone subtitles JSON array
    this.subtitles = JSON.parse(JSON.stringify(video.subtitles || []));
    this.isModalVisible = true;
  }

  saveSubtitles() {
    this.saving = true;
    this.adminSvc.updateYoutubeVideo(
      this.editingVideo.videoId,
      this.editingVideo.targetLang,
      this.editingVideo.title,
      this.subtitles
    ).subscribe({
      next: () => {
        this.msg.success('Lưu phụ đề cập nhật thành công!');
        this.isModalVisible = false;
        this.saving = false;
        this.load(); // Refresh grid to update standard details
      },
      error: () => {
        this.msg.error('Có lỗi xảy ra khi lưu phụ đề');
        this.saving = false;
      }
    });
  }

  formatTime(seconds: number): string {
    if (!seconds && seconds !== 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
