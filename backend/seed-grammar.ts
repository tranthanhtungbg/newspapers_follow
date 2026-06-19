import { PrismaClient, Level } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Đang xóa dữ liệu grammar cũ...');
  await prisma.userGrammarProgress.deleteMany();
  await prisma.grammarLesson.deleteMany();
  await prisma.grammarTopic.deleteMany();

  console.log('Đang seed dữ liệu grammar mới...');

  // ==========================================
  // LEVEL: BEGINNER
  // ==========================================

  // Topic 1: Các Thì Hiện Tại (Present Tenses)
  await prisma.grammarTopic.create({
    data: {
      title: 'Các Thì Hiện Tại (Present Tenses)',
      description: 'Hiện tại đơn, Hiện tại tiếp diễn và Hiện tại hoàn thành.',
      level: Level.BEGINNER,
      order: 1,
      lessons: {
        create: [
          {
            title: 'Thì Hiện Tại Đơn (Present Simple)',
            order: 1,
            content: `
# Thì Hiện Tại Đơn (Present Simple)

Thì hiện tại đơn được dùng để diễn tả các hành động chung chung, thói quen lặp đi lặp lại hoặc các sự thật hiển nhiên.

## 1. Công thức (Structure)
- **Khẳng định**:
  - Với ĐT To Be: \`S + am/is/are + O\` (*I am a teacher. She is tall.*)
  - Với ĐT Thường: \`S + V(s/es) + O\` (*He plays tennis.*)
- **Phủ định**:
  - Với ĐT To Be: \`S + am/is/are + not + O\`
  - Với ĐT Thường: \`S + do/does + not + V(nguyên thể) + O\` (*We don't like coffee.*)
- **Nghi vấn**:
  - Với ĐT To Be: \`Am/Is/Are + S + O?\`
  - Với ĐT Thường: \`Do/Does + S + V(nguyên thể) + O?\` (*Does he study English?*)

## 2. Cách dùng chính (Usage)
- Diễn tả thói quen, hành động lặp đi lặp lại ở hiện tại:
  *I walk to school every day.*
- Diễn tả chân lý, sự thật hiển nhiên:
  *Water boils at 100 degrees Celsius.*
- Diễn tả thời khóa biểu, lịch trình cố định:
  *The train leaves at 8:00 AM tomorrow.*

## 3. Dấu hiệu nhận biết (Signal Words)
*always, usually, often, sometimes, rarely, never, every day, every week...*
            `,
            exercises: [
              { question: "She ___ (drink) milk every morning.", answer: "drinks" },
              { question: "They ___ (not / play) football on Sundays.", answer: "do not play" },
              { question: "___ (he / study) English at school?", answer: "Does he study" },
              { question: "The sun ___ (rise) in the East.", answer: "rises" },
              { question: "Water ___ (boil) at 100 degrees.", answer: "boils" }
            ]
          },
          {
            title: 'Thì Hiện Tại Tiếp Diễn (Present Continuous)',
            order: 2,
            content: `
# Thì Hiện Tại Tiếp Diễn (Present Continuous)

Thì hiện tại tiếp diễn dùng để diễn tả hành động đang xảy ra tại thời điểm nói hoặc xung quanh thời điểm nói.

## 1. Công thức (Structure)
- **Khẳng định**: \`S + am/is/are + V-ing\` (*I am studying.*)
- **Phủ định**: \`S + am/is/are + not + V-ing\` (*She is not working.*)
- **Nghi vấn**: \`Am/Is/Are + S + V-ing?\` (*Are they sleeping?*)

## 2. Cách dùng chính (Usage)
- Diễn tả hành động đang thực sự diễn ra ngay lúc nói:
  *Listen! The baby is crying.*
- Diễn tả hành động đang diễn ra nhưng không nhất thiết ngay lúc nói (mang tính chất tạm thời):
  *I am reading an interesting book these days.*
- Diễn tả một sự sắp xếp hoặc kế hoạch định sẵn trong tương lai gần:
  *We are meeting our clients tomorrow.*
- Diễn tả sự phàn nàn về một thói quen xấu (thường dùng kèm với "always"):
  *You are always losing your keys!*

## 3. Dấu hiệu nhận biết (Signal Words)
*now, right now, at present, at the moment, Look!, Listen!, Keep silent!...*
            `,
            exercises: [
              { question: "Listen! The birds ___ (sing).", answer: "are singing" },
              { question: "I ___ (read) a very interesting book at the moment.", answer: "am reading" },
              { question: "They ___ (not / work) today because of the holiday.", answer: "are not working" },
              { question: "What ___ (you / do) right now?", answer: "are you doing" },
              { question: "She ___ (study) for her exam this week.", answer: "is studying" }
            ]
          },
          {
            title: 'Thì Hiện Tại Hoàn Thành (Present Perfect)',
            order: 3,
            content: `
# Thì Hiện Tại Hoàn Thành (Present Perfect)

Thì hiện tại hoàn thành dùng để diễn tả hành động xảy ra trong quá khứ kéo dài đến hiện tại hoặc có kết quả/ảnh hưởng liên quan đến hiện tại.

## 1. Công thức (Structure)
- **Khẳng định**: \`S + have/has + V(P2/V-ed)\` (*He has written three books.*)
- **Phủ định**: \`S + have/has + not + V(P2/V-ed)\` (*We haven't seen her today.*)
- **Nghi vấn**: \`Have/Has + S + V(P2/V-ed)?\` (*Have you ever been to Paris?*)

## 2. Cách dùng chính (Usage)
- Hành động bắt đầu trong quá khứ và vẫn tiếp diễn ở hiện tại:
  *I have lived in Hanoi for 5 years.*
- Hành động vừa mới xảy ra xong:
  *She has just finished her project.*
- Diễn tả trải nghiệm, kinh nghiệm tính tới thời điểm hiện tại:
  *I have never eaten raw fish before.*
- Hành động xảy ra trong quá khứ nhưng kết quả của nó quan trọng ở hiện tại:
  *I have lost my keys. (I cannot enter my house now).*

## 3. Dấu hiệu nhận biết (Signal Words)
*just, recently, lately, already, yet, ever, never, since + mốc thời gian, for + khoảng thời gian, so far, up to now...*
            `,
            exercises: [
              { question: "I ___ (live) in Hanoi for five years.", answer: "have lived" },
              { question: "She ___ (never / eat) sushi before.", answer: "has never eaten" },
              { question: "We ___ (already / finish) our homework.", answer: "have already finished" },
              { question: "___ (you / ever / travel) to Japan?", answer: "Have you ever traveled" },
              { question: "He ___ (not / see) his keys since yesterday.", answer: "has not seen" }
            ]
          }
        ]
      }
    }
  });

  // Topic 2: Các Thì Tương Lai (Future Tenses)
  await prisma.grammarTopic.create({
    data: {
      title: 'Các Thì Tương Lai (Future Tenses)',
      description: 'Tương lai đơn, Tương lai gần và Tương lai tiếp diễn.',
      level: Level.BEGINNER,
      order: 2,
      lessons: {
        create: [
          {
            title: 'Tương lai đơn & Tương lai gần (Will vs Be Going To)',
            order: 1,
            content: `
# Tương lai đơn (Will) vs Tương lai gần (Be Going To)

Hai cấu trúc này đều dùng để nói về tương lai nhưng khác biệt ở tính kế hoạch và căn cứ.

## 1. Tương lai đơn (Will)
- **Công thức**: \`S + will + V(nguyên thể)\`
- **Cách dùng**:
  - Quyết định thực hiện hành động ngay tại thời điểm nói (không có dự tính trước):
    *A: It is cold. B: I will close the window.*
  - Phỏng đoán tương lai không có căn cứ chắc chắn ở hiện tại (thường là ý kiến cá nhân):
    *I think it will rain tomorrow.*
  - Lời hứa, lời đe dọa, lời yêu cầu:
    *I will help you with your homework.*

## 2. Tương lai gần (Be Going To)
- **Công thức**: \`S + am/is/are + going to + V(nguyên thể)\`
- **Cách dùng**:
  - Dự định, kế hoạch đã được lên trước thời điểm nói:
    *We are going to buy a new car next month.*
  - Phỏng đoán tương lai dựa trên căn cứ, dấu hiệu rõ ràng ở hiện tại:
    *Look at those dark clouds! It is going to rain.*
            `,
            exercises: [
              { question: "A: I am cold. B: I ___ (close) the window.", answer: "will close" },
              { question: "Look at those black clouds! It ___ (rain).", answer: "is going to rain" },
              { question: "We ___ (have) a party next Saturday. We already sent invitations.", answer: "are going to have" },
              { question: "I think he ___ (win) the election.", answer: "will win" },
              { question: "A: Why are you holding that bucket? B: I ___ (wash) the car.", answer: "am going to wash" }
            ]
          },
          {
            title: 'Tương Lai Tiếp Diễn (Future Continuous)',
            order: 2,
            content: `
# Tương Lai Tiếp Diễn (Future Continuous)

Thì tương lai tiếp diễn dùng để diễn tả hành động sẽ đang diễn ra tại một thời điểm hoặc khoảng thời gian xác định trong tương lai.

## 1. Công thức (Structure)
- **Khẳng định**: \`S + will + be + V-ing\` (*This time tomorrow, I will be flying.*)
- **Phủ định**: \`S + will + not + be + V-ing\`
- **Nghi vấn**: \`Will + S + be + V-ing?\`

## 2. Cách dùng chính (Usage)
- Diễn tả hành động sẽ đang xảy ra tại một thời điểm cụ thể trong tương lai:
  *At 9 PM tonight, we will be watching a movie.*
- Diễn tả hành động đang xảy ra ở tương lai thì một hành động khác xen vào (hành động xen vào chia hiện tại đơn):
  *When you arrive tomorrow, I will be waiting for you at the airport.*

## 3. Dấu hiệu nhận biết (Signal Words)
*at this time/at this moment + thời gian trong tương lai, at + giờ cụ thể + ngày trong tương lai...*
            `,
            exercises: [
              { question: "This time tomorrow, we ___ (fly) to New York.", answer: "will be flying" },
              { question: "Don't call me at 8 PM. I ___ (watch) my favorite show.", answer: "will be watching" },
              { question: "They ___ (work) on the project all day tomorrow.", answer: "will be working" }
            ]
          }
        ]
      }
    }
  });

  // Topic 3: Từ Loại: Danh từ, Đại từ & Mạo từ
  await prisma.grammarTopic.create({
    data: {
      title: 'Từ Loại: Danh từ, Đại từ & Mạo từ',
      description: 'Danh từ đếm được / không đếm được, mạo từ a/an/the và các đại từ nhân xưng.',
      level: Level.BEGINNER,
      order: 3,
      lessons: {
        create: [
          {
            title: 'Danh từ và Mạo từ (A/An/The)',
            order: 1,
            content: `
# Danh từ & Mạo từ (A/An/The)

Hiểu rõ cách phân loại danh từ đếm được, không đếm được và cách áp dụng mạo từ xác định / không xác định.

## 1. Danh từ đếm được (Countable Nouns)
- Có cả dạng số ít và số nhiều (thường thêm -s/-es).
- Đi kèm được với số đếm trực tiếp: *one apple, two books*.

## 2. Danh từ không đếm được (Uncountable Nouns)
- Không đếm được bằng số lượng trực tiếp. Chỉ có dạng số ít.
- Thường chỉ chất lỏng, chất khí, danh từ trừu tượng hoặc các danh mục chung: *water, money, information, advice, furniture*.

## 3. Mạo từ không xác định (A / An)
- Chỉ dùng trước danh từ đếm được số ít, chưa xác định (nhắc tới lần đầu).
- **An**: Dùng trước danh từ bắt đầu bằng nguyên âm khi phát âm (u, e, o, a, i): *an apple, an hour*.
- **A**: Dùng trước phụ âm: *a car, a university*.

## 4. Mạo từ xác định (The)
- Dùng cho cả danh từ số ít, số nhiều, đếm được hay không đếm được mà cả người nói lẫn người nghe đều đã biết rõ hoặc là duy nhất: *the Sun, the door, the book you lent me*.
            `,
            exercises: [
              { question: "I bought ___ (an / a) umbrella.", answer: "an" },
              { question: "I need some ___ (information / informations) about the flight.", answer: "information" },
              { question: "The book is on ___ (the / a) desk next to you.", answer: "the" },
              { question: "Would you like ___ (a / an) orange?", answer: "an" },
              { question: "___ (The / A) water in this bottle is cold.", answer: "The" }
            ]
          },
          {
            title: 'Đại từ & Tính từ sở hữu (Pronouns & Possessives)',
            order: 2,
            content: `
# Đại từ & Tính từ sở hữu (Pronouns & Possessives)

Phân biệt đại từ nhân xưng chủ ngữ, tân ngữ, tính từ sở hữu và đại từ sở hữu.

## 1. Đại từ nhân xưng chủ ngữ (Subject Pronouns)
Làm chủ ngữ trong câu: *I, You, We, They, He, She, It*.
*She is my friend.*

## 2. Đại từ tân ngữ (Object Pronouns)
Làm tân ngữ đứng sau động từ hoặc giới từ: *me, you, us, them, him, her, it*.
*Please help me.*

## 3. Tính từ sở hữu (Possessive Adjectives)
Đứng trước danh từ để chỉ sự sở hữu: *my, your, our, their, his, her, its*.
*This is my book.*

## 4. Đại từ sở hữu (Possessive Pronouns)
Thay thế hoàn toàn cho cụm "Tính từ sở hữu + Danh từ": *mine, yours, ours, theirs, his, hers*.
*This book is mine. (mine = my book)*
            `,
            exercises: [
              { question: "This is not my pen. It is ___ (hers / her).", answer: "hers" },
              { question: "They brought ___ (their / theirs) bags with them.", answer: "their" },
              { question: "She helped ___ (him / he) with the laundry.", answer: "him" }
            ]
          }
        ]
      }
    }
  });

  // ==========================================
  // LEVEL: INTERMEDIATE
  // ==========================================

  // Topic 4: Các Thì Quá Khứ (Past Tenses)
  await prisma.grammarTopic.create({
    data: {
      title: 'Các Thì Quá Khứ (Past Tenses)',
      description: 'Quá khứ đơn, Quá khứ tiếp diễn và Quá khứ hoàn thành.',
      level: Level.INTERMEDIATE,
      order: 1,
      lessons: {
        create: [
          {
            title: 'Quá khứ đơn & Quá khứ tiếp diễn (Past Simple vs Past Continuous)',
            order: 1,
            content: `
# Quá khứ đơn vs Quá khứ tiếp diễn

Kết hợp hai thì này để kể lại câu chuyện hoặc mô tả các hành động xảy ra đồng thời.

## 1. Quá khứ đơn (Past Simple)
- **Công thức**: \`S + V-ed / V(cột 2)\`
- **Cách dùng**: Hành động đã bắt đầu và kết thúc hoàn toàn trong quá khứ:
  *I visited my grandparents yesterday.*
- **Dấu hiệu**: *yesterday, ago, last week, in 2010...*

## 2. Quá khứ tiếp diễn (Past Continuous)
- **Công thức**: \`S + was/were + V-ing\`
- **Cách dùng**: Hành động đang diễn ra tại một mốc thời gian cụ thể trong quá khứ:
  *At 8 PM last night, I was studying.*

## 3. Sự kết hợp (When & While)
- Diễn tả một hành động đang kéo dài liên tục thì một hành động ngắn khác bất chợt xen vào:
  - Hành động đang diễn ra (chia QKTD)
  - Hành động xen vào (chia QKĐ)
  *While I was walking home, it started to rain.*
  *We were watching TV when the phone rang.*
            `,
            exercises: [
              { question: "While I ___ (walk) home, it started to rain.", answer: "was walking" },
              { question: "He ___ (break) his leg when he was playing football.", answer: "broke" },
              { question: "We ___ (watch) TV when the lights went out.", answer: "were watching" },
              { question: "Yesterday, I ___ (arrive) at 8, read a book, and then went to sleep.", answer: "arrived" },
              { question: "She ___ (not / study) when her parents came back.", answer: "was not studying" }
            ]
          },
          {
            title: 'Quá Khứ Hoàn Thành (Past Perfect)',
            order: 2,
            content: `
# Quá Khứ Hoàn Thành (Past Perfect)

Thì quá khứ hoàn thành dùng để diễn tả một hành động xảy ra trước một hành động khác hoặc trước một thời điểm khác trong quá khứ.

## 1. Công thức (Structure)
- **Khẳng định**: \`S + had + V(P2/V-ed)\` (*He had gone out when I called.*)
- **Phủ định**: \`S + had + not + V(P2/V-ed)\`
- **Nghi vấn**: \`Had + S + V(P2/V-ed)?\`

## 2. Cách dùng chính (Usage)
- Diễn tả hành động xảy ra trước một hành động khác trong quá khứ (hành động trước chia QKHT, hành động sau chia QKĐ):
  *By the time the train arrived, we had bought the tickets.*
- Kết hợp với cấu trúc câu điều kiện loại 3 hoặc câu ước quá khứ.

## 3. Dấu hiệu nhận biết (Signal Words)
*by the time, before, after, as soon as, when...*
            `,
            exercises: [
              { question: "By the time the police arrived, the thief ___ (run) away.", answer: "had run" },
              { question: "We ___ (wait) for three hours before the bus finally came.", answer: "had been waiting" },
              { question: "He failed the test because he ___ (not / prepare) at all.", answer: "had not prepared" }
            ]
          }
        ]
      }
    }
  });

  // Topic 5: Câu Bị Động (Passive Voice)
  await prisma.grammarTopic.create({
    data: {
      title: 'Câu Bị Động (Passive Voice)',
      description: 'Thể bị động cơ bản, thể bị động khách quan và truyền khiến.',
      level: Level.INTERMEDIATE,
      order: 2,
      lessons: {
        create: [
          {
            title: 'Thể Bị Động Cơ Bản',
            order: 1,
            content: `
# Thể Bị Động Cơ Bản (Passive Voice)

Thể bị động được dùng khi ta muốn nhấn mạnh vào đối tượng chịu tác động của hành động hơn là bản thân tác nhân thực hiện.

## 1. Công thức tổng quát (General Formula)
**Active**: \`S + V + O\`
**Passive**: \`S (từ O) + BE + V(P2/V-ed) + (by O-tác nhân)\`

Động từ "To Be" được chia dựa theo thì của câu chủ động gốc:
- **Hiện tại đơn**: am/is/are + V(p2)
- **Hiện tại tiếp diễn**: am/is/are + being + V(p2)
- **Quá khứ đơn**: was/were + V(p2)
- **Hiện tại hoàn thành**: have/has + been + V(p2)
- **Tương lai đơn**: will + be + V(p2)
- **Động từ khuyết thiếu (modal verbs)**: modal + be + V(p2)
            `,
            exercises: [
              { question: "The window ___ (break) by a baseball yesterday.", answer: "was broken" },
              { question: "Many new roads ___ (build) in this city every year.", answer: "are built" },
              { question: "This report ___ (must / submit) before Friday.", answer: "must be submitted" },
              { question: "The project ___ (complete) by the team next month.", answer: "will be completed" },
              { question: "The room ___ (clean) right now.", answer: "is being cleaned" }
            ]
          },
          {
            title: 'Bị động khách quan & Thể truyền khiến (Impersonal & Causative)',
            order: 2,
            content: `
# Bị động khách quan & Thể truyền khiến

Cấu trúc bị động nâng cao trong văn viết trang trọng và giao tiếp hàng ngày.

## 1. Bị động khách quan (Impersonal Passive)
Dùng để truyền đạt ý kiến chung của mọi người, tin đồn, báo cáo.
- **Cấu trúc**: \`It + is + said/reported/believed/thought + that + S + V\`
  *It is said that he lives abroad.*
- **Cấu trúc rút gọn**: \`S + is + said/reported/believed/thought + to + V (hoặc to have P2)\`
  *He is said to live abroad.*

## 2. Thể truyền khiến bị động (Causative Passive)
Dùng khi nhờ hoặc thuê ai đó làm việc gì cho mình (chứ bản thân không tự làm).
- **Cấu trúc Have**: \`S + have + something + V(P2/V-ed)\`
  *I had my hair cut yesterday. (Có ai đó cắt tóc cho tôi)*
- **Cấu trúc Get**: \`S + get + something + V(P2/V-ed)\`
  *She got her car washed.*
            `,
            exercises: [
              { question: "It is ___ (say) that he is a genius.", answer: "said" },
              { question: "I had my car ___ (repair) yesterday.", answer: "repaired" },
              { question: "She got her hair ___ (cut) at the salon.", answer: "cut" }
            ]
          }
        ]
      }
    }
  });

  // Topic 6: Câu So Sánh (Comparisons)
  await prisma.grammarTopic.create({
    data: {
      title: 'Câu So Sánh (Comparisons)',
      description: 'So sánh bằng, so sánh hơn, so sánh nhất và so sánh kép.',
      level: Level.INTERMEDIATE,
      order: 3,
      lessons: {
        create: [
          {
            title: 'So Sánh Hơn, Nhất & Bằng',
            order: 1,
            content: `
# So Sánh Hơn, Nhất & Bằng

Cách dùng tính từ và trạng từ trong các mẫu câu so sánh cơ bản.

## 1. So sánh bằng (Equality)
- **Công thức**: \`S + V + as + Adj/Adv + as + O\`
  *She is as tall as her mother.*

## 2. So sánh hơn (Comparative)
- Với tính từ/trạng từ ngắn (1 âm tiết): \`Adj/Adv-er + than\` (*taller than, bigger than*)
- Với tính từ/trạng từ dài (2 âm tiết trở lên): \`more + Adj/Adv + than\` (*more beautiful than, more carefully than*)

## 3. So sánh nhất (Superlative)
- Với tính từ/trạng từ ngắn: \`the + Adj/Adv-est\` (*the tallest, the biggest*)
- Với tính từ/trạng từ dài: \`the most + Adj/Adv\` (*the most expensive, the most intelligent*)
            `,
            exercises: [
              { question: "This exam is ___ (difficult) than the last one.", answer: "more difficult" },
              { question: "He is the ___ (good) player in our team.", answer: "best" },
              { question: "She is as ___ (intelligent) as her sister.", answer: "intelligent" },
              { question: "Gold is much ___ (heavy) than wood.", answer: "heavier" },
              { question: "It was the ___ (bad) movie I have ever watched.", answer: "worst" }
            ]
          },
          {
            title: 'So Sánh Kép (Double Comparatives)',
            order: 2,
            content: `
# So Sánh Kép (Double Comparatives)

So sánh kép dùng để diễn tả sự thay đổi đồng tiến (càng... thì càng...).

## 1. Cấu trúc song song
- **Cấu trúc**: \`The + Comparative + S + V, the + Comparative + S + V\`
  *The harder you work, the more successful you will be.*
  *The warmer the weather, the better I feel.*

## 2. Cách chia từ loại trong so sánh kép:
- Sử dụng tính từ ngắn: *The shorter...*
- Sử dụng tính từ dài: *The more comfortable...*
- Sử dụng danh từ: *The more money you save...*
            `,
            exercises: [
              { question: "The ___ (more / much) you practice, the easier it gets.", answer: "more" },
              { question: "The older he got, the ___ (wise) he became.", answer: "wiser" },
              { question: "The hotter it is, the ___ (uncomfortable) I feel.", answer: "more uncomfortable" }
            ]
          }
        ]
      }
    }
  });

  // Topic 7: Câu Trực Tiếp - Gián Tiếp (Reported Speech)
  await prisma.grammarTopic.create({
    data: {
      title: 'Câu Trực Tiếp - Gián Tiếp (Reported Speech)',
      description: 'Chuyển đổi câu trần thuật, câu hỏi, mệnh lệnh sang gián tiếp.',
      level: Level.INTERMEDIATE,
      order: 4,
      lessons: {
        create: [
          {
            title: 'Câu Trần Thuật & Câu Hỏi Gián Tiếp',
            order: 1,
            content: `
# Câu Trần Thuật & Câu Hỏi Gián Tiếp

Các nguyên tắc quan trọng khi tường thuật lại lời nói trực tiếp của người khác.

## 1. Nguyên tắc 1: Đổi đại từ
Đại từ nhân xưng, tính từ sở hữu và đại từ sở hữu cần đổi sao cho hợp ngữ cảnh: *I -> he/she, we -> they, my -> his/her*.

## 2. Nguyên tắc 2: Lùi thì (Backshift of Tenses)
- Hiện tại đơn -> Quá khứ đơn
- Hiện tại tiếp diễn -> Quá khứ tiếp diễn
- Hiện tại hoàn thành / Quá khứ đơn -> Quá khứ hoàn thành
- Tương lai đơn (will) -> Tương lai trong quá khứ (would)
- Can -> Could, Must -> Had to

## 3. Nguyên tắc 3: Đổi từ chỉ thời gian và nơi chốn
*now -> then, today -> that day, yesterday -> the day before, tomorrow -> the next day, here -> there, this -> that*.

## 4. Câu hỏi gián tiếp
- **Yes/No Question**: Sử dụng \`if\` hoặc \`whether\`. Mệnh đề sau đó không đảo ngữ.
  *Direct: "Are you okay?" -> Indirect: He asked me if I was okay.*
- **Wh- Question**: Giữ nguyên từ hỏi Wh-. Mệnh đề sau đó không đảo ngữ.
  *Direct: "Where do you go?" -> Indirect: She asked where I went.*
            `,
            exercises: [
              { question: "\"I am busy today,\" he said. -> He said that he ___ busy that day.", answer: "was" },
              { question: "\"Where do you live?\" she asked. -> She asked me where I ___ (live).", answer: "lived" },
              { question: "\"I will call you tomorrow,\" she told him. -> She told him that she ___ call him the next day.", answer: "would" }
            ]
          },
          {
            title: 'Mệnh Lệnh & Lời Khuyên Gián Tiếp',
            order: 2,
            content: `
# Tường thuật mệnh lệnh, yêu cầu và đề nghị

Sử dụng động từ tường thuật đặc biệt để tránh lặp đi lặp lại từ "say/tell".

## 1. Câu mệnh lệnh/Yêu cầu (Commands / Requests)
- Công thức: \`S + asked/told/ordered + O + to + V (hoặc not to V)\`
  *Direct: "Please close the door." -> Indirect: He asked me to close the door.*
  *Direct: "Don't touch it." -> Indirect: She told me not to touch it.*

## 2. Lời khuyên, đề nghị (Advice / Suggestions)
- Khuyên bảo: \`S + advised + O + to V\`
  *Direct: "You should see a doctor." -> Indirect: The doctor advised me to see a doctor.*
- Đề nghị: \`S + suggested + V-ing\` hoặc \`S + suggested + that + S + (should) + V\`
  *Direct: "Let's go swimming." -> Indirect: He suggested going swimming.*
            `,
            exercises: [
              { question: "\"Please sit down,\" the teacher said. -> The teacher asked the students ___ sit down.", answer: "to" },
              { question: "\"Let's go out,\" he said. -> He suggested ___ (go) out.", answer: "going" }
            ]
          }
        ]
      }
    }
  });

  // ==========================================
  // LEVEL: ADVANCED
  // ==========================================

  // Topic 8: Mệnh Đề Quan Hệ (Relative Clauses)
  await prisma.grammarTopic.create({
    data: {
      title: 'Mệnh Đề Quan Hệ (Relative Clauses)',
      description: 'Mệnh đề xác định, không xác định, trạng từ quan hệ và rút gọn mệnh đề.',
      level: Level.ADVANCED,
      order: 1,
      lessons: {
        create: [
          {
            title: 'Mệnh Đề Xác Định & Không Xác Định',
            order: 1,
            content: `
# Mệnh Đề Xác Định & Không Xác Định

Sử dụng đại từ quan hệ để bổ nghĩa cho danh từ đứng trước.

## 1. Đại từ quan hệ (Relative Pronouns)
- **Who**: Thay cho danh từ chỉ người làm chủ ngữ/tân ngữ.
- **Whom**: Thay cho danh từ chỉ người làm tân ngữ.
- **Which**: Thay cho danh từ chỉ vật làm chủ ngữ/tân ngữ.
- **That**: Có thể thay thế cho Who/Whom/Which trong mệnh đề quan hệ xác định.
- **Whose**: Thay cho sở hữu của người hoặc vật.

## 2. Mệnh đề xác định (Defining)
- Cần thiết để làm rõ danh từ đứng trước, không có dấu phẩy.
  *The teacher who taught me English is very kind.*

## 3. Mệnh đề không xác định (Non-defining)
- Chỉ cung cấp thêm thông tin phụ, danh từ trước đã xác định rõ (tên riêng, có đại từ sở hữu, chỉ định), bắt buộc phải ngăn cách bằng dấu phẩy. Không được dùng "That" thay thế.
  *Mr. Smith, who lives next door, is a doctor.*
            `,
            exercises: [
              { question: "The man ___ lives next door is a famous musician.", answer: "who" },
              { question: "My laptop, ___ I bought last year, is already slow.", answer: "which" },
              { question: "The girl ___ car was stolen has called the police.", answer: "whose" }
            ]
          },
          {
            title: 'Trạng Từ Quan Hệ & Rút Gọn Mệnh Đề',
            order: 2,
            content: `
# Trạng Từ Quan Hệ & Rút Gọn Mệnh Đề

Các cấu trúc rút gọn và trạng từ chỉ nơi chốn, thời gian nâng cao.

## 1. Trạng từ quan hệ (Relative Adverbs)
- **Where**: Thay thế cho từ chỉ nơi chốn (= on/at/in which).
- **When**: Thay thế cho từ chỉ thời gian (= on/at/in which).
- **Why**: Thay thế cho cụm từ chỉ nguyên nhân, thường sau "the reason" (= for which).

## 2. Rút gọn mệnh đề quan hệ (Reduced Relative Clauses)
Rút gọn bằng cách lược bỏ đại từ quan hệ và động từ To Be:
- **Dùng V-ing (chủ động)**: Nếu mệnh đề ở thể chủ động:
  *The girl who is sitting over there... -> The girl sitting over there...*
- **Dùng V-ed / V(P2) (bị động)**: Nếu mệnh đề ở thể bị động:
  *The bridge which was built in 1990... -> The bridge built in 1990...*
- **Dùng To-V**: Khi danh từ đi kèm với số thứ tự (first, second...), so sánh nhất hoặc "the only":
  *He was the first man who walked on the moon. -> He was the first man to walk on the moon.*
            `,
            exercises: [
              { question: "That is the hospital ___ I was born.", answer: "where" },
              { question: "The man ___ (sit) next to me was asleep.", answer: "sitting" },
              { question: "The letters ___ (send) yesterday were important.", answer: "sent" }
            ]
          }
        ]
      }
    }
  });

  // Topic 9: Câu Điều Kiện & Câu Ước (Conditionals & Wish)
  await prisma.grammarTopic.create({
    data: {
      title: 'Câu Điều Kiện & Câu Ước (Conditionals & Wish)',
      description: 'Điều kiện loại 1, 2, 3, điều kiện hỗn hợp và cấu trúc Wish/If only.',
      level: Level.ADVANCED,
      order: 2,
      lessons: {
        create: [
          {
            title: 'Các Loại Câu Điều Kiện & Điều Kiện Hỗn Hợp',
            order: 1,
            content: `
# Các Loại Câu Điều Kiện & Điều Kiện Hỗn Hợp

Các cấu trúc giả định sự việc có thể hoặc không thể xảy ra dưới các điều kiện nhất định.

## 1. Câu điều kiện loại 0 (Zero Conditional)
- Diễn tả sự thật hiển nhiên, chân lý khoa học.
- **Công thức**: \`If + S + V(htđ), S + V(htđ)\`
  *If you heat ice, it melts.*

## 2. Câu điều kiện loại 1 (First Conditional)
- Diễn tả sự việc có thể xảy ra ở hiện tại hoặc tương lai.
- **Công thức**: \`If + S + V(htđ), S + will + V(nguyên thể)\`
  *If it rains, we will stay at home.*

## 3. Câu điều kiện loại 2 (Second Conditional)
- Diễn tả giả định không có thật, trái với thực tế ở hiện tại. Động từ be chia "were" cho tất cả ngôi.
- **Công thức**: \`If + S + V(qkđ), S + would/could + V(nguyên thể)\`
  *If I were rich, I would travel around the world.*

## 4. Câu điều kiện loại 3 (Third Conditional)
- Diễn tả giả định không có thật, trái với thực tế trong quá khứ.
- **Công thức**: \`If + S + had + V(p2), S + would + have + V(p2)\`
  *If I had studied harder, I would have passed the exam.*

## 5. Câu điều kiện hỗn hợp (Mixed Conditionals)
Thường dùng loại phối hợp: Giả định quá khứ để lại kết quả ở hiện tại.
- **Công thức**: \`If + S + had + V(p2) (loại 3), S + would + V(nguyên thể) (loại 2)\`
  *If he had taken the map, he wouldn't be lost now.*
            `,
            exercises: [
              { question: "If I had known the answer, I ___ (tell) you.", answer: "would have told" },
              { question: "If I ___ (be) you, I would accept the job offer.", answer: "were" },
              { question: "If you heat water to 100 degrees, it ___ (boil).", answer: "boils" },
              { question: "If you study hard, you ___ (pass) the exam.", answer: "will pass" },
              { question: "If he had started earlier, he ___ (not / be) late now.", answer: "would not be" }
            ]
          },
          {
            title: 'Cấu trúc ước muốn WISH & IF ONLY',
            order: 2,
            content: `
# Cấu trúc ước muốn WISH & IF ONLY

Bày tỏ mong muốn về những sự việc trái với thực tế hoặc mong muốn thay đổi hành vi của ai đó.

## 1. Ước ở tương lai (Future Wish)
- Diễn tả mong muốn thay đổi điều gì trong tương lai hoặc phàn nàn hành vi ai đó:
- **Công thức**: \`S + wish + S + would/could + V(nguyên thể)\`
  *I wish it would stop raining.*

## 2. Ước ở hiện tại (Present Wish)
- Diễn tả mong muốn trái ngược với thực tế hiện tại:
- **Công thức**: \`S + wish + S + V(qkđ / were)\`
  *I wish I could speak Japanese. (Thực tế là không thể)*

## 3. Ước ở quá khứ (Past Wish)
- Diễn tả sự nuối tiếc về một việc đã xảy ra hoặc không xảy ra trong quá khứ:
- **Công thức**: \`S + wish + S + had + V(p2)\`
  *She wishes she had not sold her house.*

*Lưu ý: "If only" có thể dùng thay thế cho "Wish" để tăng tính biểu cảm mạnh mẽ hơn (Giá mà...).*
            `,
            exercises: [
              { question: "I wish I ___ (can) speak French.", answer: "could" },
              { question: "She wishes she ___ (not / say) that to him yesterday.", answer: "had not said" },
              { question: "If only the weather ___ (be) better today.", answer: "were" }
            ]
          }
        ]
      }
    }
  });

  // Topic 10: Giả Định Nâng Cao & Đảo Ngữ
  await prisma.grammarTopic.create({
    data: {
      title: 'Giả Định Nâng Cao & Đảo Ngữ',
      description: 'Câu giả định thức (Subjunctive Mood) và các cấu trúc đảo ngữ (Inversion).',
      level: Level.ADVANCED,
      order: 3,
      lessons: {
        create: [
          {
            title: 'Câu Giả Định Thức (Subjunctive Mood)',
            order: 1,
            content: `
# Câu Giả Định Thức (Subjunctive Mood)

Câu giả định thức dùng để nhấn mạnh tính khẩn cấp, quan trọng hoặc đề xuất một việc cần làm. Động từ trong mệnh đề giả định luôn ở dạng nguyên thể không chia.

## 1. Công thức tổng quát:
\`S1 + V1 (suggest, demand, recommend, crucial, important...) + that + S2 + V(nguyên thể không chia)\`

## 2. Các động từ giả định (Subjunctive Verbs)
*suggest, recommend, demand, insist, request, propose, ask, require...*
* The doctor insisted that she **take** a rest. (Không chia "takes" dù chủ ngữ là she).

## 3. Các tính từ giả định (Subjunctive Adjectives)
*important, crucial, vital, essential, necessary, urgent...*
* It is essential that he **not be** late. (Dạng phủ định là "not + V-inf").
            `,
            exercises: [
              { question: "It is crucial that she ___ (submit) the application on time.", answer: "submit" },
              { question: "The doctor recommended that he ___ (stop) smoking.", answer: "stop" },
              { question: "I suggest that she ___ (not / go) there alone.", answer: "not go" }
            ]
          },
          {
            title: 'Các Cấu Trúc Đảo Ngữ (Inversion)',
            order: 2,
            content: `
# Các Cấu Trúc Đảo Ngữ (Inversion)

Đảo ngữ là hình thức đảo trợ động từ lên trước chủ ngữ nhằm mục đích nhấn mạnh. Thường xảy ra khi câu bắt đầu bằng trạng từ phủ định hoặc giới hạn.

## 1. Đảo ngữ với phó từ phủ định
*never, rarely, seldom, hardly, barely, scarcely, little...*
- **Công thức**: \`Trạng từ phủ định + Trợ động từ + S + V\`
  *Rarely have I seen such a beautiful view.* (Thay vì: I have rarely seen...)

## 2. Cấu trúc "Ngay khi... thì..."
- \`Hardly / Scarcely + had + S + V(p2) + when + S + V(qkd)\`
- \`No sooner + had + S + V(p2) + than + S + V(qkd)\`
  *No sooner had we left the house than it started to rain.*

## 3. Đảo ngữ trong câu điều kiện
Lược bỏ "If" và đảo trợ động từ lên trước chủ ngữ:
- **Loại 1**: \`Should + S + V...\` (*Should you need help, please call me.*)
- **Loại 2**: \`Were + S + to V...\` (*Were I to win the lottery, I would buy a house.*)
- **Loại 3**: \`Had + S + V(p2)...\` (*Had I known the truth, I wouldn't have come.*)
            `,
            exercises: [
              { question: "Never before ___ (I / see) such a beautiful sunset.", answer: "have I seen" },
              { question: "Only when she left ___ (he / realize) how much he loved her.", answer: "did he realize" },
              { question: "Had I ___ (know) you were coming, I would have baked a cake.", answer: "known" }
            ]
          }
        ]
      }
    }
  });

  console.log('✅ Đã tạo thành công cơ sở dữ liệu Grammar phong phú (Beginner - Advanced)!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
