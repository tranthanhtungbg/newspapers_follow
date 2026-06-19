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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AdminService } from '../../core/services/admin.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-vocabulary-manager',
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
    NzSelectModule,
    NzTagModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h2>📖 Quản lý Từ vựng Hệ thống</h2>
        <p>Danh sách toàn bộ từ vựng cá nhân được học viên lưu trữ. Bạn có thể thêm hoặc xóa từ vựng.</p>
      </div>
      <div>
        <button nz-button nzType="primary" (click)="openAddModal()">
          <span nz-icon nzType="plus-circle"></span> Thêm từ vựng
        </button>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <nz-card [nzBordered]="false" style="border-radius:12px; margin-bottom: 24px;">
      <div class="search-box">
        <nz-input-group [nzPrefix]="searchIcon">
          <input nz-input [(ngModel)]="search" placeholder="Tìm kiếm từ vựng, nghĩa dịch..." (keyup.enter)="load()" style="width:360px" />
        </nz-input-group>
        <ng-template #searchIcon><span nz-icon nzType="search"></span></ng-template>
        <button nz-button nzType="primary" (click)="load()">Tìm kiếm</button>
      </div>
    </nz-card>

    <!-- Table -->
    <nz-card [nzBordered]="false" style="border-radius:12px">
      <nz-table #table [nzData]="items" [nzLoading]="loading" nzSize="middle"
        [nzTotal]="total" [(nzPageIndex)]="page" [nzPageSize]="20" (nzPageIndexChange)="load()" [nzFrontPagination]="false">
        <thead>
          <tr>
            <th nzWidth="20%">Từ gốc</th>
            <th nzWidth="15%">Phiên âm (IPA)</th>
            <th nzWidth="25%">Nghĩa tiếng Việt</th>
            <th nzWidth="10%">Loại từ</th>
            <th nzWidth="20%">Người học</th>
            <th nzWidth="10%">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of table.data">
            <td><strong>{{ item.word }}</strong></td>
            <td><code>{{ item.ipa || '-' }}</code></td>
            <td>{{ item.translation }}</td>
            <td>
              <nz-tag *ngIf="item.partOfSpeech" nzColor="orange">{{ item.partOfSpeech }}</nz-tag>
              <span *ngIf="!item.partOfSpeech">-</span>
            </td>
            <td>
              <div class="user-info">
                <strong>{{ item.user?.name }}</strong>
                <span class="user-email">{{ item.user?.email }}</span>
              </div>
            </td>
            <td>
              <button nz-button nzType="text" nzDanger nzSize="small" (click)="deleteItem(item)">
                Xóa
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-card>

    <!-- Add Vocabulary Modal -->
    <nz-modal [(nzVisible)]="isModalVisible" nzTitle="Thêm từ vựng mới"
      [nzOkLoading]="saving" [nzOkText]="'Lưu từ vựng'" [nzCancelText]="'Hủy'"
      (nzOnOk)="saveVocab()" (nzOnCancel)="isModalVisible = false">
      <ng-container *nzModalContent>
        <div class="form-container">
          <div class="form-item">
            <label>Người học sở hữu:</label>
            <nz-select [(ngModel)]="selectedUserId" style="width: 100%;" nzShowSearch nzPlaceHolder="Chọn tài khoản học viên">
              <nz-option *ngFor="let u of usersList" [nzValue]="u.id" [nzLabel]="u.name + ' (' + u.email + ')'"></nz-option>
            </nz-select>
          </div>
          <div class="form-item">
            <label>Từ vựng (Tiếng Anh):</label>
            <input nz-input [(ngModel)]="newWord" placeholder="Nhập từ vựng (ví dụ: delicious)" />
          </div>
          <div class="form-item">
            <label>Nghĩa dịch (Tiếng Việt):</label>
            <input nz-input [(ngModel)]="newTranslation" placeholder="Nghĩa của từ" />
          </div>
          <div class="form-item">
            <label>Phiên âm (IPA):</label>
            <input nz-input [(ngModel)]="newIpa" placeholder="Ví dụ: /dɪˈlɪʃəs/" />
          </div>
          <div class="form-item">
            <label>Loại từ (Part of Speech):</label>
            <input nz-input [(ngModel)]="newPartOfSpeech" placeholder="Ví dụ: adjective, noun..." />
          </div>
          <div class="form-item">
            <label>Câu ví dụ (Context Sentence):</label>
            <textarea nz-input [(ngModel)]="newContextSentence" nzAutosize placeholder="Nhập câu ví dụ sử dụng từ này"></textarea>
          </div>
        </div>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h2 { font-size: 22px; font-weight: 800; margin: 0; }
    .page-header p { color: #888; margin: 4px 0 0; }
    .search-box { display: flex; gap: 12px; align-items: center; }
    .user-info { display: flex; flex-direction: column; }
    .user-email { font-size: 11px; color: #888; }
    .form-container { display: flex; flex-direction: column; gap: 14px; }
    .form-item { display: flex; flex-direction: column; gap: 4px; }
    .form-item label { font-weight: 600; color: #4a5568; }
    textarea.nz-input { border-radius: 4px; padding: 4px 8px; }
  `]
})
export class VocabularyManagerComponent implements OnInit {
  items: any[] = [];
  loading = false;
  search = '';
  page = 1;
  total = 0;

  isModalVisible = false;
  saving = false;

  usersList: any[] = [];
  selectedUserId = '';
  newWord = '';
  newTranslation = '';
  newIpa = '';
  newPartOfSpeech = '';
  newContextSentence = '';

  constructor(
    private adminSvc: AdminService,
    private userSvc: UserService,
    private msg: NzMessageService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.adminSvc.getGlobalVocabulary({ page: this.page, limit: 20, search: this.search }).subscribe({
      next: res => {
        this.items = res?.data ?? [];
        this.total = res?.meta?.total ?? 0;
        this.loading = false;
      },
      error: () => {
        this.msg.error('Lỗi khi tải danh sách từ vựng');
        this.loading = false;
      }
    });
  }

  deleteItem(item: any) {
    const confirmation = confirm(`Bạn có chắc chắn muốn xóa từ "${item.word}" khỏi danh sách?`);
    if (confirmation) {
      this.adminSvc.deleteVocabulary(item.id).subscribe({
        next: () => {
          this.msg.success(`Đã xóa từ "${item.word}" thành công`);
          this.load();
        },
        error: () => this.msg.error('Lỗi khi xóa từ vựng')
      });
    }
  }

  openAddModal() {
    this.selectedUserId = '';
    this.newWord = '';
    this.newTranslation = '';
    this.newIpa = '';
    this.newPartOfSpeech = '';
    this.newContextSentence = '';

    // Load users list for selection
    this.userSvc.getUsers({ limit: 100 }).subscribe({
      next: res => {
        this.usersList = res?.data ?? [];
        if (this.usersList.length > 0) {
          this.selectedUserId = this.usersList[0].id;
        }
        this.isModalVisible = true;
      },
      error: () => this.msg.error('Lỗi khi tải danh sách tài khoản học viên')
    });
  }

  saveVocab() {
    if (!this.selectedUserId) {
      this.msg.warning('Vui lòng chọn học viên sở hữu');
      return;
    }
    if (!this.newWord || !this.newTranslation) {
      this.msg.warning('Vui lòng nhập Từ gốc và Nghĩa dịch');
      return;
    }

    this.saving = true;
    this.adminSvc.createVocabulary({
      userId: this.selectedUserId,
      word: this.newWord,
      translation: this.newTranslation,
      ipa: this.newIpa,
      partOfSpeech: this.newPartOfSpeech,
      contextSentence: this.newContextSentence,
      sourceLang: 'en',
      targetLang: 'vi'
    }).subscribe({
      next: () => {
        this.msg.success('Thêm từ vựng thành công!');
        this.isModalVisible = false;
        this.saving = false;
        this.page = 1;
        this.load();
      },
      error: () => {
        this.msg.error('Lỗi khi thêm từ vựng');
        this.saving = false;
      }
    });
  }
}
