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
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-newspapers',
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
    NzSpinModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h2>📰 Quản lý Báo chí & Bài viết (Cache)</h2>
        <p>Xem danh sách các bài viết được lưu trữ trong CSDL, xóa cache hoặc pre-fetch (tải trước) bài viết mới.</p>
      </div>
    </div>

    <!-- Pre-fetch Form -->
    <nz-card [nzBordered]="false" style="border-radius:12px; margin-bottom: 24px;">
      <h3 style="margin-bottom:12px; font-weight:700">⚡ Tải trước bài viết mới (Warm-up Cache)</h3>
      <div class="prefetch-box">
        <input nz-input [(ngModel)]="prefetchUrl" placeholder="Dán URL bài báo (ví dụ: e.vnexpress.net, dev.to...)" style="flex:1" [disabled]="prefetching" />
        <button nz-button nzType="primary" [nzLoading]="prefetching" (click)="prefetch()">
          <span nz-icon nzType="cloud-download"></span> Tải & Phân tích
        </button>
      </div>
    </nz-card>

    <!-- Filter & Search Bar -->
    <nz-card [nzBordered]="false" style="border-radius:12px; margin-bottom: 24px;">
      <div class="search-box">
        <nz-input-group [nzPrefix]="searchIcon">
          <input nz-input [(ngModel)]="search" placeholder="Tìm kiếm tiêu đề, URL bài báo..." (keyup.enter)="load()" style="width:360px" />
        </nz-input-group>
        <ng-template #searchIcon><span nz-icon nzType="search"></span></ng-template>
        <button nz-button nzType="primary" (click)="load()">Tìm kiếm</button>
      </div>
    </nz-card>

    <!-- Table -->
    <nz-card [nzBordered]="false" style="border-radius:12px">
      <nz-table #table [nzData]="articles" [nzLoading]="loading" nzSize="middle"
        [nzTotal]="total" [(nzPageIndex)]="page" [nzPageSize]="20" (nzPageIndexChange)="load()" [nzFrontPagination]="false">
        <thead>
          <tr>
            <th nzWidth="35%">Tiêu đề</th>
            <th nzWidth="30%">Đường dẫn (URL)</th>
            <th nzWidth="15%">Thời gian cache</th>
            <th nzWidth="10%">Thời gian đọc</th>
            <th nzWidth="10%">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let a of table.data">
            <td>
              <div class="title-cell" (click)="viewContent(a)">
                <span nz-icon nzType="file-text" style="color: #667eea; font-size:16px;"></span>
                <strong class="clickable-title">{{ a.title || 'Không có tiêu đề' }}</strong>
              </div>
            </td>
            <td>
              <a [href]="a.url" target="_blank" class="url-link">
                {{ a.url }} <span nz-icon nzType="export" style="font-size:11px"></span>
              </a>
            </td>
            <td>{{ a.cachedAt | date:'dd/MM/yyyy HH:mm' }}</td>
            <td>{{ a.readingTimeMinutes ? a.readingTimeMinutes + ' phút' : 'N/A' }}</td>
            <td>
              <div style="display:flex; gap:8px">
                <button nz-button nzType="link" nzSize="small" (click)="viewContent(a)">
                  Xem
                </button>
                <button nz-button nzType="text" nzDanger nzSize="small" (click)="deleteArticle(a.id)">
                  Xóa
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-card>

    <!-- Detailed Content Modal -->
    <nz-modal [(nzVisible)]="isModalVisible" [nzTitle]="selectedArticle?.title || 'Chi tiết nội dung'"
      [nzWidth]="800" [nzFooter]="modalFooter" (nzOnCancel)="isModalVisible = false">
      <ng-container *nzModalContent>
        <div style="max-height: 550px; overflow-y: auto; padding-right:8px;">
          <p><strong>Nguồn: </strong> <a [href]="selectedArticle?.url" target="_blank">{{ selectedArticle?.url }}</a></p>
          <hr style="margin: 12px 0; border: 0; border-top: 1px solid #eee;" />
          <div class="parsed-content-preview" [innerText]="selectedArticle?.content"></div>
        </div>
      </ng-container>
      <ng-template #modalFooter>
        <button nz-button nzType="primary" (click)="isModalVisible = false">Đóng</button>
      </ng-template>
    </nz-modal>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h2 { font-size: 22px; font-weight: 800; margin: 0; }
    .page-header p { color: #888; margin: 4px 0 0; }
    .prefetch-box { display: flex; gap: 12px; max-width: 800px; }
    .search-box { display: flex; gap: 12px; align-items: center; }
    .title-cell { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .clickable-title:hover { color: #667eea; text-decoration: underline; }
    .url-link { color: #595959; font-size: 13px; word-break: break-all; }
    .url-link:hover { color: #667eea; }
    .parsed-content-preview { white-space: pre-wrap; font-family: 'Lora', Georgia, serif; line-height: 1.6; font-size: 15px; color: #2d3748; }
  `]
})
export class NewspapersComponent implements OnInit {
  articles: any[] = [];
  loading = false;
  search = '';
  page = 1;
  total = 0;

  prefetchUrl = '';
  prefetching = false;

  isModalVisible = false;
  selectedArticle: any = null;

  constructor(private adminSvc: AdminService, private msg: NzMessageService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.adminSvc.getArticles({ page: this.page, limit: 20, search: this.search }).subscribe({
      next: res => {
        this.articles = res?.data ?? [];
        this.total = res?.meta?.total ?? 0;
        this.loading = false;
      },
      error: () => {
        this.msg.error('Lỗi khi tải danh sách bài viết');
        this.loading = false;
      }
    });
  }

  prefetch() {
    if (!this.prefetchUrl || !this.prefetchUrl.startsWith('http')) {
      this.msg.warning('Vui lòng nhập đường dẫn URL hợp lệ');
      return;
    }

    this.prefetching = true;
    this.adminSvc.preFetchArticle(this.prefetchUrl).subscribe({
      next: () => {
        this.msg.success('Tải và phân tích bài viết thành công!');
        this.prefetchUrl = '';
        this.prefetching = false;
        this.page = 1;
        this.load();
      },
      error: (err) => {
        this.msg.error(err?.error?.message || 'Có lỗi xảy ra khi tải bài viết');
        this.prefetching = false;
      }
    });
  }

  deleteArticle(id: string) {
    this.adminSvc.deleteArticle(id).subscribe({
      next: () => {
        this.msg.success('Xóa cache bài viết thành công');
        this.load();
      },
      error: () => this.msg.error('Lỗi khi xóa bài viết')
    });
  }

  viewContent(article: any) {
    this.selectedArticle = article;
    this.isModalVisible = true;
  }
}
