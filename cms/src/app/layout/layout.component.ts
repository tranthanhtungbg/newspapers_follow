import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../core/services/auth.service';
import { AdminService } from '../core/services/admin.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterModule, FormsModule,
    NzLayoutModule, NzMenuModule, NzIconModule, NzAvatarModule,
    NzDropDownModule, NzTagModule, NzModalModule, NzInputModule
  ],
  template: `
    <nz-layout style="min-height:100vh">
      <nz-sider nzCollapsible [(nzCollapsed)]="collapsed" [nzTrigger]="null" nzWidth="240px" nzTheme="dark">
        <div class="sider-logo">
          <span class="logo-icon">📚</span>
          <span class="logo-text" *ngIf="!collapsed">LingoReader</span>
        </div>
        <ul nz-menu nzTheme="dark" nzMode="inline">
          <li nz-menu-item [routerLink]="['/dashboard']" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="dashboard"></span>
            <span>Dashboard</span>
          </li>
          <li nz-menu-item [routerLink]="['/grammar']" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="book"></span>
            <span>Quản lý Grammar</span>
          </li>
          <li nz-menu-item [routerLink]="['/newspapers']" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="read"></span>
            <span>Quản lý Báo chí</span>
          </li>
          <li nz-menu-item [routerLink]="['/youtube']" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="youtube"></span>
            <span>Quản lý YouTube</span>
          </li>
          <li nz-menu-item [routerLink]="['/vocabulary']" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="profile"></span>
            <span>Quản lý Từ vựng</span>
          </li>
          <li nz-menu-item [routerLink]="['/users']" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="team"></span>
            <span>Người dùng</span>
          </li>
        </ul>
        <div class="sider-footer">
          <span class="version-tag">v0.1.0</span>
        </div>
      </nz-sider>

      <nz-layout>
        <nz-header>
          <div class="header-inner">
            <span nz-icon [nzType]="collapsed ? 'menu-unfold' : 'menu-fold'"
              class="trigger" (click)="collapsed = !collapsed">
            </span>
            <div class="header-right" nz-dropdown [nzDropdownMenu]="userMenu" nzTrigger="click">
              <nz-avatar nzIcon="user" nzSize="small" style="background:#667eea;cursor:pointer"></nz-avatar>
              <span class="user-name">{{ (auth.user$ | async)?.name }}</span>
              <nz-tag nzColor="purple" style="margin-left:6px">ADMIN</nz-tag>
              <span nz-icon nzType="down" style="font-size:10px;color:#666;margin-left:4px"></span>
            </div>
            <nz-dropdown-menu #userMenu="nzDropdownMenu">
              <ul nz-menu>
                <li nz-menu-item (click)="openPasswordModal()">
                  <span nz-icon nzType="key"></span> Đổi mật khẩu
                </li>
                <li nz-menu-item (click)="auth.logout()">
                  <span nz-icon nzType="logout"></span> Đăng xuất
                </li>
              </ul>
            </nz-dropdown-menu>
          </div>
        </nz-header>

        <nz-content>
          <div class="content-wrap">
            <router-outlet></router-outlet>
          </div>
        </nz-content>
      </nz-layout>
    </nz-layout>

    <!-- Change Password Modal -->
    <nz-modal [(nzVisible)]="isPasswordModalVisible" nzTitle="Đổi mật khẩu tài khoản"
      [nzOkLoading]="changingPassword" [nzOkText]="'Cập nhật'" [nzCancelText]="'Hủy'"
      (nzOnOk)="submitChangePassword()" (nzOnCancel)="isPasswordModalVisible = false">
      <ng-container *nzModalContent>
        <div style="display:flex; flex-direction:column; gap:12px">
          <div>
            <label style="font-weight:600; color:#4a5568">Mật khẩu hiện tại:</label>
            <input nz-input type="password" [(ngModel)]="currentPassword" placeholder="Nhập mật khẩu hiện tại" style="margin-top:4px" />
          </div>
          <div>
            <label style="font-weight:600; color:#4a5568">Mật khẩu mới:</label>
            <input nz-input type="password" [(ngModel)]="newPassword" placeholder="Nhập mật khẩu mới" style="margin-top:4px" />
          </div>
          <div>
            <label style="font-weight:600; color:#4a5568">Xác nhận mật khẩu mới:</label>
            <input nz-input type="password" [(ngModel)]="confirmPassword" placeholder="Nhập lại mật khẩu mới" style="margin-top:4px" />
          </div>
        </div>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    .sider-logo {
      height: 64px; display: flex; align-items: center; justify-content: center;
      gap: 10px; padding: 0 16px; border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .logo-icon { font-size: 28px; }
    .logo-text { color: white; font-weight: 800; font-size: 16px; letter-spacing: 0.5px; }
    nz-header {
      background: white; padding: 0; border-bottom: 1px solid #f0f0f0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06); position: sticky; top: 0; z-index: 100;
    }
    .header-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; padding: 0 24px; }
    .trigger { font-size: 18px; cursor: pointer; color: #595959; transition: color 0.3s; }
    .trigger:hover { color: #667eea; }
    .header-right { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .user-name { font-weight: 600; color: #333; font-size: 14px; }
    nz-content { background: #f5f6fa; }
    .content-wrap { padding: 24px; min-height: calc(100vh - 64px); }
    .sider-footer { padding: 16px; text-align: center; position: absolute; bottom: 0; width: 100%; }
    .version-tag { color: rgba(255,255,255,0.35); font-size: 11px; }
  `]
})
export class LayoutComponent {
  collapsed = false;

  isPasswordModalVisible = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  changingPassword = false;

  constructor(
    public auth: AuthService,
    public router: Router,
    private adminSvc: AdminService,
    private msg: NzMessageService
  ) {}

  openPasswordModal() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.isPasswordModalVisible = true;
  }

  submitChangePassword() {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.msg.warning('Vui lòng nhập đầy đủ các trường thông tin');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.msg.warning('Mật khẩu mới và mật khẩu nhập lại không khớp');
      return;
    }
    if (this.newPassword.length < 6) {
      this.msg.warning('Mật khẩu mới phải từ 6 ký tự trở lên');
      return;
    }

    this.changingPassword = true;
    this.adminSvc.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.msg.success('Đổi mật khẩu thành công!');
        this.isPasswordModalVisible = false;
        this.changingPassword = false;
      },
      error: (err) => {
        this.msg.error(err?.error?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
        this.changingPassword = false;
      }
    });
  }
}
