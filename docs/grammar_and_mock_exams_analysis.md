# Phân tích Nghiệp vụ: Module Ngữ pháp (Grammar) & Đề thi thử (Mock Exams)

## 1. Tổng quan & Mục tiêu
Mục tiêu của đợt nâng cấp này là chuyển đổi LingoReader từ một công cụ hỗ trợ đọc báo và lưu từ vựng trở thành một **Nền tảng học Tiếng Anh toàn diện**.
Hệ thống sẽ được bổ sung 2 module chính:
1. **Grammar Module:** Hệ thống học ngữ pháp theo lộ trình từ Cơ bản (Beginner) đến Nâng cao (Advanced).
2. **Mock Exam Module:** Hệ thống thi thử đa cấp độ (IELTS, TOEIC, CEFR...) với khả năng chấm điểm tự động và đặc biệt là **tính năng giải thích chi tiết (Detailed Explanations)** cho từng câu hỏi.

---

## 2. Phân tích chi tiết Module Ngữ pháp (Grammar Path)

### 2.1. Cấu trúc thông tin (Information Architecture)
- **Grammar Topic (Chủ đề):** Các nhóm ngữ pháp lớn để phân loại (VD: *Tenses - Các thì*, *Conditionals - Câu điều kiện*, *Passive Voice - Câu bị động*).
- **Grammar Lesson (Bài học):** Một chủ đề có nhiều bài học. Mỗi bài học bao gồm:
  - **Lý thuyết:** Định dạng Markdown, làm nổi bật cấu trúc câu.
  - **Ví dụ (Examples):** Câu ví dụ thực tế, dịch nghĩa tiếng Việt.
  - **Mini Quiz:** Bài tập ngắn để củng cố ngay kiến thức vừa học (Trắc nghiệm, Điền từ).
- **Gamification & Tracking:**
  - Hệ thống "Mở khóa" (Unlock): Hoàn thành bài Cơ bản mới được học bài Nâng cao.
  - Lưu tiến độ (Progress): Đã học, Chưa học, Điểm số bài tập.

### 2.2. User Flow (Luồng người dùng)
1. Truy cập trang `/grammar`.
2. Giao diện hiển thị theo dạng **Lộ trình học (Roadmap/Skill Tree)**.
3. Chọn một bài học -> Đọc lý thuyết -> Click nút "Làm bài tập củng cố".
4. Làm Mini Quiz -> Nhận điểm số -> Cập nhật tiến trình học -> Nhận điểm kinh nghiệm (EXP / Streak).

---

## 3. Phân tích chi tiết Module Đề thi thử (Mock Exams) - Nâng cấp tương lai

Đây là module mang lại giá trị cốt lõi cao nhất, giúp người dùng tự đánh giá năng lực và học từ lỗi sai.

### 3.1. Cấu trúc thông tin (Information Architecture)
- **Exam Category (Danh mục):** IELTS, TOEIC, THPT Quốc Gia, CEFR A1-C2.
- **Mock Exam (Đề thi):** Cấu hình tổng quan của đề thi (Thời gian làm bài, Số lượng phần thi/part).
- **Exam Question (Câu hỏi):** 
  - Đề bài (Văn bản, File Audio, Hình ảnh).
  - Danh sách lựa chọn (Options).
  - Đáp án đúng (Correct Answer).
  - **Explanation (Giải thích chi tiết):** Nội dung giải thích lý do tại sao đáp án A đúng mà B, C, D lại sai. Phần này có thể do Admin soạn sẵn hoặc tự động gọi AI (Gemini/ChatGPT) để tạo ra.

### 3.2. Tính năng "Chấm điểm & Giải thích" (Core Feature)
Khi user nộp bài:
1. **Chấm điểm tự động:** So sánh đáp án của user với đáp án hệ thống, tính toán ra Band Score (IELTS) hoặc Điểm số (TOEIC).
2. **Review Panel (Bảng đánh giá):** 
   - Danh sách các câu Đúng / Sai.
   - Khi click vào một câu sai, hệ thống hiển thị:
     - Lựa chọn của bạn (Màu đỏ).
     - Lựa chọn đúng (Màu xanh).
     - **Hộp thoại Giải thích:** *"Câu này sử dụng thì Quá khứ hoàn thành vì hành động đã xảy ra trước một thời điểm trong quá khứ. Dấu hiệu nhận biết là chữ 'By the time...' -> Chọn C."*
3. **AI Tutor Assistant (Nâng cao):** Cạnh mỗi câu giải thích, cung cấp nút **"Hỏi thêm AI"** để user có thể chat trực tiếp với AI nếu đọc giải thích sẵn vẫn chưa hiểu.

---

## 4. Đề xuất Thiết kế Database (Prisma Schema Proposal)

```prisma
// ==========================================
// 1. GRAMMAR MODULE
// ==========================================
enum Level {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

model GrammarTopic {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title       String   @db.VarChar(255)
  description String?
  level       Level    @default(BEGINNER)
  order       Int      @default(0)
  lessons     GrammarLesson[]
}

model GrammarLesson {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  topicId     String   @map("topic_id") @db.Uuid
  title       String   @db.VarChar(255)
  content     String   // Markdown
  exercises   Json     @default("[]") // Các bài tập nhỏ
  order       Int      @default(0)
  progress    UserGrammarProgress[]
}

model UserGrammarProgress {
  userId      String   @map("user_id") @db.Uuid
  lessonId    String   @map("lesson_id") @db.Uuid
  isCompleted Boolean  @default(false)
  score       Int?     
  @@id([userId, lessonId])
}

// ==========================================
// 2. MOCK EXAM MODULE (Future)
// ==========================================
model ExamCategory {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String   // TOEIC, IELTS...
  exams       MockExam[]
}

model MockExam {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  categoryId  String   @db.Uuid
  title       String
  timeLimit   Int      // In minutes
  questions   ExamQuestion[]
  results     ExamResult[]
}

model ExamQuestion {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  examId      String   @db.Uuid
  questionText String
  options     Json     // ["Option A", "Option B", "Option C", "Option D"]
  correctAns  Int      // Index (0, 1, 2, 3)
  explanation String?  // Giải thích chi tiết tại sao chọn đáp án này
}

model ExamResult {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String   @db.Uuid
  examId      String   @db.Uuid
  totalScore  Float
  answers     Json     // Lưu lại list id câu hỏi & đáp án user đã chọn
  timeSpent   Int      // Số phút đã làm
  createdAt   DateTime @default(now())
}
```

---

## 5. Lộ trình Triển khai (Implementation Plan)

### Phase 1: Xây dựng nền tảng Grammar (Tuần 1)
- Cập nhật Prisma Schema cho `GrammarTopic`, `GrammarLesson`, `UserGrammarProgress`.
- Viết Backend API CRUD cho Admin quản lý bài học.
- Viết API lấy Lộ trình học cho User.
- Xây dựng giao diện Frontend `/grammar` hiển thị Skill Tree.

### Phase 2: Hệ thống bài tập Mini Quiz (Tuần 2)
- Tích hợp Json exercises vào mỗi bài Grammar.
- Xây dựng Component chấm điểm ngay tại Frontend.
- Lưu trữ điểm số (Progress) xuống Backend.

### Phase 3: Module Đề Thi Thử & AI Explanation (Tuần 3-4)
- Thiết kế Schema Mock Exams.
- Làm giao diện đếm ngược thời gian, làm bài thi.
- Logic chấm điểm, trả về kết quả.
- **Trang Review (Cốt lõi):** So sánh đáp án, hiển thị nội dung `explanation`. Tích hợp Prompt AI để gen tự động giải thích nếu Admin chưa viết sẵn.
