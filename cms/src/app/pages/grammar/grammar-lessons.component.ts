import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { GrammarService } from '../../core/services/grammar.service';

@Component({
  selector: 'app-grammar-lessons',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    NzTableModule, NzButtonModule, NzCardModule, NzModalModule, NzFormModule,
    NzInputModule, NzTagModule, NzIconModule, NzPopconfirmModule, NzDividerModule, NzCollapseModule, NzBreadCrumbModule
  ],
  template: `
    <nz-breadcrumb style="margin-bottom:16px">
      <nz-breadcrumb-item><a routerLink="/grammar">Grammar</a></nz-breadcrumb-item>
      <nz-breadcrumb-item>{{ topicTitle }}</nz-breadcrumb-item>
    </nz-breadcrumb>

    <div class="page-header">
      <div>
        <h2>📝 Bài học: {{ topicTitle }}</h2>
        <p>Thêm, sửa nội dung và bài tập cho từng bài học</p>
      </div>
      <button nz-button nzType="primary" (click)="openModal()">
        <span nz-icon nzType="plus"></span> Thêm bài học
      </button>
    </div>

    <div class="lessons-list">
      <nz-card *ngFor="let l of lessons" class="lesson-card" [nzBordered]="false">
        <div class="lesson-header">
          <div class="lesson-title">
            <span class="order-badge">{{ l.order }}</span>
            <strong>{{ l.title }}</strong>
          </div>
          <div class="lesson-actions">
            <button nz-button nzType="default" nzSize="small" (click)="openModal(l)">
              <span nz-icon nzType="edit"></span> Sửa
            </button>
            <button nz-button nzDanger nzSize="small"
              nz-popconfirm nzPopconfirmTitle="Xóa bài học này?" (nzOnConfirm)="deleteLesson(l.id)">
              <span nz-icon nzType="delete"></span>
            </button>
          </div>
        </div>
        <nz-collapse *ngIf="l.content">
          <nz-collapse-panel nzHeader="Xem nội dung">
            <pre class="content-preview">{{ l.content }}</pre>
          </nz-collapse-panel>
        </nz-collapse>
        <div class="exercises-preview" *ngIf="l.exercises?.length">
          <nz-tag nzColor="blue">{{ l.exercises.length }} bài tập</nz-tag>
        </div>
      </nz-card>
    </div>

    <nz-modal
      [(nzVisible)]="modalVisible"
      [nzTitle]="editingId ? 'Sửa bài học' : 'Thêm bài học mới'"
      (nzOnCancel)="closeModal()"
      (nzOnOk)="submitForm()"
      [nzOkLoading]="saving"
      nzOkText="Lưu"
      nzCancelText="Hủy"
      nzWidth="800px"
    >
      <ng-container *nzModalContent>
        <form nz-form [formGroup]="form" nzLayout="vertical">
          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="16">
              <nz-form-item>
                <nz-form-label nzRequired>Tên bài học</nz-form-label>
                <nz-form-control nzErrorTip="Bắt buộc">
                  <input nz-input formControlName="title" placeholder="VD: Thì Hiện Tại Đơn" />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="8">
              <nz-form-item>
                <nz-form-label nzRequired>Thứ tự</nz-form-label>
                <nz-form-control>
                  <input nz-input type="number" formControlName="order" />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>
          <nz-form-item>
            <nz-form-label nzRequired>Nội dung (Markdown)</nz-form-label>
            <nz-form-control nzExtra="Hỗ trợ Markdown: # Heading, **in đậm**, *in nghiêng*, - danh sách">
              <textarea nz-input formControlName="content" [nzAutosize]="{minRows:12,maxRows:24}"
                style="font-family:monospace;font-size:13px"
                placeholder="# 1. Cách dùng&#10;- Ví dụ...&#10;&#10;# 2. Cấu trúc&#10;- **Khẳng định**: S + V"></textarea>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label>Bài tập (JSON Array)</nz-form-label>
            <nz-form-control nzExtra='Mỗi phần tử: {"question":"She ___ (go).","answer":"goes"}'>
              <textarea nz-input formControlName="exercisesJson" [nzAutosize]="{minRows:4,maxRows:12}"
                style="font-family:monospace;font-size:12px"
                placeholder='[&#10;  {"question": "She ___ (go) to school.", "answer": "goes"},&#10;  {"question": "They ___ (not/come) yesterday.", "answer": "did not come"}&#10;]'></textarea>
            </nz-form-control>
          </nz-form-item>
        </form>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h2 { font-size: 22px; font-weight: 800; margin: 0; }
    .page-header p { color: #888; margin: 4px 0 0; }
    .lessons-list { display: flex; flex-direction: column; gap: 12px; }
    .lesson-card { border-radius: 12px; border: 1px solid #f0f0f0; }
    .lesson-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .lesson-title { display: flex; align-items: center; gap: 12px; }
    .order-badge {
      width: 32px; height: 32px; border-radius: 50%; background: #667eea; color: white;
      display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0;
    }
    .lesson-actions { display: flex; gap: 8px; }
    .content-preview { font-size: 12px; background: #fafafa; padding: 12px; border-radius: 8px; white-space: pre-wrap; overflow: auto; max-height: 300px; }
    .exercises-preview { margin-top: 8px; }
  `]
})
export class GrammarLessonsComponent implements OnInit {
  topicId = '';
  topicTitle = '';
  lessons: any[] = [];
  loading = false;
  modalVisible = false;
  saving = false;
  editingId: string | null = null;

  form!: ReturnType<FormBuilder['group']>;

  constructor(private route: ActivatedRoute, private svc: GrammarService, private fb: FormBuilder, private msg: NzMessageService) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      order: [1, Validators.required],
      content: ['', Validators.required],
      exercisesJson: ['[]']
    });
  }

  ngOnInit() {
    this.topicId = this.route.snapshot.params['id'];
    this.load();
    this.svc.getTopic(this.topicId).subscribe(res => {
      this.topicTitle = res?.title ?? '';
    });
  }

  load() {
    this.loading = true;
    this.svc.getLessons(this.topicId).subscribe({
      next: res => { this.lessons = res ?? []; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openModal(lesson?: any) {
    this.editingId = lesson?.id ?? null;
    this.form.reset({
      title: lesson?.title ?? '',
      order: lesson?.order ?? (this.lessons.length + 1),
      content: lesson?.content ?? '',
      exercisesJson: lesson?.exercises ? JSON.stringify(lesson.exercises, null, 2) : '[]'
    });
    this.modalVisible = true;
  }

  closeModal() { this.modalVisible = false; }

  submitForm() {
    if (this.form.invalid) { Object.values(this.form.controls).forEach(c => { c.markAsDirty(); c.updateValueAndValidity(); }); return; }
    let exercises: any[] = [];
    try { exercises = JSON.parse(this.form.value.exercisesJson || '[]'); } catch { this.msg.error('JSON bài tập không hợp lệ!'); return; }
    this.saving = true;
    const data = { title: this.form.value.title, order: this.form.value.order, content: this.form.value.content, exercises };
    const req = this.editingId ? this.svc.updateLesson(this.editingId, data) : this.svc.createLesson(this.topicId, data);
    req.subscribe({
      next: () => { this.msg.success('Đã lưu!'); this.saving = false; this.closeModal(); this.load(); },
      error: () => { this.msg.error('Lỗi!'); this.saving = false; }
    });
  }

  deleteLesson(id: string) {
    this.svc.deleteLesson(id).subscribe({
      next: () => { this.msg.success('Đã xóa!'); this.load(); },
      error: () => this.msg.error('Xóa thất bại!')
    });
  }
}
