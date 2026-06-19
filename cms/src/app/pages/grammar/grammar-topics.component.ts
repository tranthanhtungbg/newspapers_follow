import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { GrammarService } from '../../core/services/grammar.service';

@Component({
  selector: 'app-grammar-topics',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, ReactiveFormsModule,
    NzTableModule, NzButtonModule, NzCardModule, NzModalModule, NzFormModule,
    NzInputModule, NzSelectModule, NzTagModule, NzIconModule, NzPopconfirmModule, NzToolTipModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h2>📚 Quản lý Grammar</h2>
        <p>Tạo và chỉnh sửa các chủ đề ngữ pháp tiếng Anh</p>
      </div>
      <button nz-button nzType="primary" (click)="openModal()">
        <span nz-icon nzType="plus"></span> Thêm chủ đề
      </button>
    </div>

    <nz-card [nzBordered]="false" style="border-radius:12px">
      <nz-table #table [nzData]="topics" [nzLoading]="loading" nzSize="middle" [nzPageSize]="20">
        <thead>
          <tr>
            <th nzWidth="60px">STT</th>
            <th>Tên chủ đề</th>
            <th>Mô tả</th>
            <th nzWidth="130px">Cấp độ</th>
            <th nzWidth="100px">Bài học</th>
            <th nzWidth="160px">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let t of table.data; let i = index">
            <td>{{ i + 1 }}</td>
            <td><strong>{{ t.title }}</strong></td>
            <td class="desc-cell">{{ t.description }}</td>
            <td>
              <nz-tag [nzColor]="levelColor(t.level)">{{ t.level }}</nz-tag>
            </td>
            <td>
              <a [routerLink]="['/grammar/topic', t.id, 'lessons']">
                {{ t._count?.lessons ?? 0 }} bài
              </a>
            </td>
            <td>
              <button nz-button nzType="link" nzSize="small" (click)="openModal(t)" nz-tooltip nzTooltipTitle="Sửa">
                <span nz-icon nzType="edit"></span>
              </button>
              <button nz-button nzType="link" nzSize="small" nzDanger
                nz-popconfirm nzPopconfirmTitle="Xóa chủ đề này?" (nzOnConfirm)="delete(t.id)">
                <span nz-icon nzType="delete"></span>
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-card>

    <!-- Modal Thêm/Sửa -->
    <nz-modal
      [(nzVisible)]="modalVisible"
      [nzTitle]="editingId ? 'Sửa chủ đề' : 'Thêm chủ đề mới'"
      (nzOnCancel)="closeModal()"
      (nzOnOk)="submitForm()"
      [nzOkLoading]="saving"
      nzOkText="Lưu"
      nzCancelText="Hủy"
      nzWidth="560px"
    >
      <ng-container *nzModalContent>
        <form nz-form [formGroup]="form" nzLayout="vertical">
          <nz-form-item>
            <nz-form-label nzRequired>Tên chủ đề</nz-form-label>
            <nz-form-control nzErrorTip="Bắt buộc">
              <input nz-input formControlName="title" placeholder="VD: Các Thì Hiện Tại" />
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label>Mô tả</nz-form-label>
            <nz-form-control>
              <textarea nz-input formControlName="description" [nzAutosize]="{minRows:2,maxRows:4}" placeholder="Mô tả ngắn..."></textarea>
            </nz-form-control>
          </nz-form-item>
          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label nzRequired>Cấp độ</nz-form-label>
                <nz-form-control>
                  <nz-select formControlName="level" style="width:100%">
                    <nz-option nzValue="BEGINNER" nzLabel="🟢 Beginner"></nz-option>
                    <nz-option nzValue="INTERMEDIATE" nzLabel="🟡 Intermediate"></nz-option>
                    <nz-option nzValue="ADVANCED" nzLabel="🔴 Advanced"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label nzRequired>Thứ tự</nz-form-label>
                <nz-form-control>
                  <input nz-input type="number" formControlName="order" placeholder="1" />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>
        </form>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h2 { font-size: 22px; font-weight: 800; margin: 0; }
    .page-header p { color: #888; margin: 4px 0 0; }
    .desc-cell { color: #666; font-size: 13px; max-width: 280px; }
  `]
})
export class GrammarTopicsComponent implements OnInit {
  topics: any[] = [];
  loading = false;
  modalVisible = false;
  saving = false;
  editingId: string | null = null;

  form!: ReturnType<FormBuilder['group']>;

  constructor(private svc: GrammarService, private fb: FormBuilder, private msg: NzMessageService) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      level: ['BEGINNER', Validators.required],
      order: [1, Validators.required]
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getTopics().subscribe({
      next: res => { this.topics = res ?? []; this.loading = false; },
      error: () => this.loading = false
    });
  }

  levelColor(l: string) {
    return { BEGINNER: 'green', INTERMEDIATE: 'gold', ADVANCED: 'red' }[l] ?? 'default';
  }

  openModal(topic?: any) {
    this.editingId = topic?.id ?? null;
    this.form.reset({ title: topic?.title ?? '', description: topic?.description ?? '', level: topic?.level ?? 'BEGINNER', order: topic?.order ?? 1 });
    this.modalVisible = true;
  }

  closeModal() { this.modalVisible = false; }

  submitForm() {
    if (this.form.invalid) { Object.values(this.form.controls).forEach(c => { c.markAsDirty(); c.updateValueAndValidity(); }); return; }
    this.saving = true;
    const data = this.form.value;
    const req = this.editingId ? this.svc.update(this.editingId, data) : this.svc.create(data);
    req.subscribe({
      next: () => {
        this.msg.success(this.editingId ? 'Đã cập nhật chủ đề!' : 'Đã tạo chủ đề mới!');
        this.saving = false; this.closeModal(); this.load();
      },
      error: () => { this.msg.error('Có lỗi xảy ra!'); this.saving = false; }
    });
  }

  delete(id: string) {
    this.svc.delete(id).subscribe({
      next: () => { this.msg.success('Đã xóa chủ đề!'); this.load(); },
      error: () => this.msg.error('Xóa thất bại!')
    });
  }
}
