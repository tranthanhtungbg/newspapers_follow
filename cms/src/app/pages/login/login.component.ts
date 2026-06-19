import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule, NzCardModule, NzAlertModule, NzIconModule],
  template: `
    <div class="login-wrap">
      <div class="login-box">
        <div class="login-header">
          <div class="logo">📚</div>
          <h1>LingoReader <span>CMS</span></h1>
          <p>Hệ thống quản trị nội dung</p>
        </div>

        <nz-card [nzBordered]="false">
          <form nz-form [formGroup]="form" (ngSubmit)="onSubmit()">
            <nz-form-item>
              <nz-form-label [nzSpan]="24" nzRequired>Email</nz-form-label>
              <nz-form-control [nzSpan]="24" nzErrorTip="Vui lòng nhập email hợp lệ">
                <nz-input-group nzPrefixIcon="mail">
                  <input nz-input formControlName="email" placeholder="admin@lingoreader.io" type="email" />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="24" nzRequired>Mật khẩu</nz-form-label>
              <nz-form-control [nzSpan]="24" nzErrorTip="Vui lòng nhập mật khẩu">
                <nz-input-group nzPrefixIcon="lock" [nzSuffix]="suffixTemplate">
                  <input nz-input [type]="showPwd ? 'text' : 'password'" formControlName="password" placeholder="••••••••" />
                </nz-input-group>
                <ng-template #suffixTemplate>
                  <span nz-icon [nzType]="showPwd ? 'eye' : 'eye-invisible'" (click)="showPwd=!showPwd" style="cursor:pointer"></span>
                </ng-template>
              </nz-form-control>
            </nz-form-item>

            <nz-alert *ngIf="error" nzType="error" [nzMessage]="error" nzShowIcon style="margin-bottom:16px"></nz-alert>

            <button nz-button nzType="primary" nzBlock [nzLoading]="loading" [disabled]="form.invalid">
              Đăng nhập
            </button>
          </form>
        </nz-card>
      </div>
    </div>
  `,
  styles: [`
    .login-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-box { width: 420px; }
    .login-header { text-align: center; margin-bottom: 32px; color: white; }
    .logo { font-size: 56px; margin-bottom: 8px; }
    h1 { font-size: 28px; font-weight: 800; margin: 0; color: white; }
    h1 span { color: #ffd666; }
    p { color: rgba(255,255,255,0.8); margin: 4px 0 0; }
    nz-card { border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
  `]
})
export class LoginComponent {
  form!: ReturnType<FormBuilder['group']>;
  loading = false;
  error = '';
  showPwd = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['admin@lingoreader.io', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: (res) => {
        const user = res.data?.user ?? res.user ?? res;
        if (user?.role !== 'ADMIN') {
          this.error = 'Tài khoản không có quyền truy cập CMS.';
          localStorage.removeItem('cms_token');
          this.loading = false;
          return;
        }
        this.router.navigate(['/']);
      },
      error: () => {
        this.error = 'Email hoặc mật khẩu không đúng.';
        this.loading = false;
      }
    });
  }
}
