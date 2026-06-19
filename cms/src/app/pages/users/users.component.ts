import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { UserService } from '../../core/services/user.service';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzCardModule,
    NzInputModule,
    NzTagModule,
    NzIconModule,
    NzAvatarModule,
    NzModalModule,
    NzSelectModule,
    NzToolTipModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h2>👥 Quản lý người dùng</h2>
        <p>Xem danh sách, thêm hoặc xóa tài khoản người dùng trong hệ thống</p>
      </div>
      <div style="display:flex; gap:12px; align-items:center;">
        <button nz-button nzType="primary" (click)="openAddModal()">
          <span nz-icon nzType="user-add"></span> Thêm người dùng
        </button>
      </div>
    </div>

    <!-- Filter & Search -->
    <nz-card [nzBordered]="false" style="border-radius:12px; margin-bottom: 24px;">
      <div class="search-box">
        <nz-input-group [nzPrefix]="searchIcon">
          <input nz-input [(ngModel)]="search" placeholder="Tìm kiếm email, tên..." (keyup.enter)="load()" style="width:280px" />
        </nz-input-group>
        <ng-template #searchIcon><span nz-icon nzType="search"></span></ng-template>
        <button nz-button nzType="primary" (click)="load()">Tìm</button>
      </div>
    </nz-card>

    <!-- Table -->
    <nz-card [nzBordered]="false" style="border-radius:12px">
      <nz-table #table [nzData]="users" [nzLoading]="loading" nzSize="middle"
        [nzTotal]="total" [(nzPageIndex)]="page" [nzPageSize]="20" (nzPageIndexChange)="load()" [nzFrontPagination]="false">
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Email</th>
            <th>Role</th>
            <th>Ngày tạo</th>
            <th nzWidth="180px">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of table.data">
            <td>
              <div class="user-cell">
                <nz-avatar [nzText]="u.name?.[0]?.toUpperCase()" nzSize="small" style="background:#667eea;flex-shrink:0"></nz-avatar>
                <strong>{{ u.name }}</strong>
              </div>
            </td>
            <td>{{ u.email }}</td>
            <td>
              <nz-tag [nzColor]="u.role === 'ADMIN' ? 'purple' : u.role === 'MODERATOR' ? 'orange' : 'blue'">{{ u.role }}</nz-tag>
            </td>
            <td>{{ u.createdAt | date:'dd/MM/yyyy' }}</td>
            <td>
              <div style="display:flex; gap:8px">
                <a [routerLink]="['/users', u.id, 'progress']">
                  <button nz-button nzType="text" nzShape="circle" nz-tooltip nzTooltipTitle="Tiến độ học tập" style="color: #1890ff;">
                    <span nz-icon nzType="bar-chart" style="font-size: 16px;"></span>
                  </button>
                </a>
                <button nz-button nzType="text" nzShape="circle" nz-tooltip nzTooltipTitle="Reset mật khẩu" (click)="openResetModal(u)" style="color: #fa8c16;">
                  <span nz-icon nzType="lock" style="font-size: 16px;"></span>
                </button>
                <button nz-button nzType="text" nzDanger nzShape="circle" nz-tooltip nzTooltipTitle="Xóa người dùng" (click)="deleteUser(u)">
                  <span nz-icon nzType="delete" style="font-size: 16px;"></span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-card>

    <!-- Add User Modal -->
    <nz-modal [(nzVisible)]="isModalVisible" nzTitle="Thêm người dùng mới"
      [nzOkLoading]="saving" [nzOkText]="'Tạo tài khoản'" [nzCancelText]="'Hủy'"
      (nzOnOk)="saveUser()" (nzOnCancel)="isModalVisible = false">
      <ng-container *nzModalContent>
        <div class="form-container">
          <div class="form-item">
            <label>Họ tên:</label>
            <input nz-input [(ngModel)]="newUserName" placeholder="Nhập tên người dùng" />
          </div>
          <div class="form-item">
            <label>Email:</label>
            <input nz-input [(ngModel)]="newUserEmail" placeholder="Nhập địa chỉ email" />
          </div>
          <div class="form-item">
            <label>Mật khẩu:</label>
            <input nz-input type="password" [(ngModel)]="newUserPassword" placeholder="Nhập mật khẩu" />
          </div>
          <div class="form-item">
            <label>Vai trò (Role):</label>
            <nz-select [(ngModel)]="newUserRole" style="width: 100%;">
              <nz-option nzValue="USER" nzLabel="USER"></nz-option>
              <nz-option nzValue="ADMIN" nzLabel="ADMIN"></nz-option>
              <nz-option nzValue="MODERATOR" nzLabel="MODERATOR"></nz-option>
              <nz-option nzValue="GUEST" nzLabel="GUEST"></nz-option>
            </nz-select>
          </div>
        </div>
      </ng-container>
    </nz-modal>

    <!-- Reset User Password Modal -->
    <nz-modal [(nzVisible)]="isResetModalVisible" [nzTitle]="'Reset mật khẩu học viên: ' + resetUserName"
      [nzOkLoading]="resetting" [nzOkText]="'Reset mật khẩu'" [nzCancelText]="'Hủy'"
      (nzOnOk)="saveResetPassword()" (nzOnCancel)="isResetModalVisible = false">
      <ng-container *nzModalContent>
        <div class="form-container">
          <div class="form-item">
            <label>Mật khẩu mới:</label>
            <input nz-input type="password" [(ngModel)]="resetNewPassword" placeholder="Nhập mật khẩu mới" />
          </div>
          <div class="form-item">
            <label>Xác nhận mật khẩu mới:</label>
            <input nz-input type="password" [(ngModel)]="resetConfirmPassword" placeholder="Nhập lại mật khẩu mới" />
          </div>
        </div>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .page-header h2 { font-size: 22px; font-weight: 800; margin: 0; }
    .page-header p { color: #888; margin: 4px 0 0; }
    .search-box { display: flex; gap: 8px; align-items: center; }
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .form-container { display: flex; flex-direction: column; gap: 14px; }
    .form-item { display: flex; flex-direction: column; gap: 4px; }
    .form-item label { font-weight: 600; color: #4a5568; }
  `]
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  loading = false;
  search = '';
  page = 1;
  total = 0;

  isModalVisible = false;
  saving = false;

  newUserName = '';
  newUserEmail = '';
  newUserPassword = '';
  newUserRole = 'USER';

  isResetModalVisible = false;
  resetting = false;
  resetUserId = '';
  resetUserName = '';
  resetNewPassword = '';
  resetConfirmPassword = '';

  constructor(
    private svc: UserService,
    private adminSvc: AdminService,
    private msg: NzMessageService
  ) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getUsers({ page: this.page, limit: 20, search: this.search }).subscribe({
      next: res => {
        this.users = res?.data ?? [];
        this.total = res?.meta?.total ?? 0;
        this.loading = false;
      },
      error: () => {
        this.msg.error('Lỗi khi tải danh sách người dùng');
        this.loading = false;
      }
    });
  }

  openAddModal() {
    this.newUserName = '';
    this.newUserEmail = '';
    this.newUserPassword = '';
    this.newUserRole = 'USER';
    this.isModalVisible = true;
  }

  openResetModal(user: any) {
    this.resetUserId = user.id;
    this.resetUserName = user.name || user.email;
    this.resetNewPassword = '';
    this.resetConfirmPassword = '';
    this.isResetModalVisible = true;
  }

  saveResetPassword() {
    if (!this.resetNewPassword || !this.resetConfirmPassword) {
      this.msg.warning('Vui lòng nhập đầy đủ mật khẩu mới');
      return;
    }
    if (this.resetNewPassword !== this.resetConfirmPassword) {
      this.msg.warning('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }
    if (this.resetNewPassword.length < 6) {
      this.msg.warning('Mật khẩu phải từ 6 ký tự trở lên');
      return;
    }

    this.resetting = true;
    this.adminSvc.resetUserPassword(this.resetUserId, { password: this.resetNewPassword }).subscribe({
      next: () => {
        this.msg.success(`Đã reset mật khẩu cho người dùng ${this.resetUserName} thành công!`);
        this.isResetModalVisible = false;
        this.resetting = false;
      },
      error: (err) => {
        this.msg.error(err?.error?.message || 'Lỗi khi reset mật khẩu');
        this.resetting = false;
      }
    });
  }

  saveUser() {
    if (!this.newUserName || !this.newUserEmail || !this.newUserPassword) {
      this.msg.warning('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    if (!this.newUserEmail.includes('@')) {
      this.msg.warning('Vui lòng nhập định dạng email hợp lệ');
      return;
    }

    this.saving = true;
    this.svc.create({
      name: this.newUserName,
      email: this.newUserEmail,
      password: this.newUserPassword,
      role: this.newUserRole
    }).subscribe({
      next: () => {
        this.msg.success('Thêm người dùng mới thành công!');
        this.isModalVisible = false;
        this.saving = false;
        this.page = 1;
        this.load();
      },
      error: (err) => {
        this.msg.error(err?.error?.message || 'Lỗi khi tạo người dùng');
        this.saving = false;
      }
    });
  }

  deleteUser(user: any) {
    nzModalConfirmHelper(
      () => {
        this.svc.delete(user.id).subscribe({
          next: () => {
            this.msg.success(`Đã xóa người dùng ${user.name}`);
            this.load();
          },
          error: () => this.msg.error('Có lỗi xảy ra khi xóa người dùng')
        });
      },
      `Bạn có chắc chắn muốn xóa người dùng <strong>${user.name}</strong> (${user.email})?`
    );
  }
}

// A quick and clean vanilla modal helper to avoid writing standard boilerplate confirming dialogs
function nzModalConfirmHelper(onConfirm: () => void, message: string) {
  const confirmation = confirm(message.replace(/<\/?[^>]+(>|$)/g, ""));
  if (confirmation) {
    onConfirm();
  }
}
