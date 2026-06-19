import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000001';

const vocabData = [
  // --- IT / Software Engineering ---
  {
    word: 'Algorithm', translation: 'Thuật toán', ipa: '/ˈæl.ɡə.rɪ.ðəm/', partOfSpeech: 'noun', tags: ['IT', 'Software Engineering'],
    examples: [{ en: 'The search algorithm is highly efficient.', vi: 'Thuật toán tìm kiếm này rất hiệu quả.' }]
  },
  {
    word: 'Deployment', translation: 'Triển khai (phần mềm)', ipa: '/dɪˈplɔɪ.mənt/', partOfSpeech: 'noun', tags: ['IT', 'Software Engineering'],
    examples: [{ en: 'The deployment of the new application went smoothly.', vi: 'Việc triển khai ứng dụng mới diễn ra suôn sẻ.' }]
  },
  {
    word: 'Bandwidth', translation: 'Băng thông', ipa: '/ˈbænd.wɪtθ/', partOfSpeech: 'noun', tags: ['IT', 'Networking'],
    examples: [{ en: 'High bandwidth is required for video streaming.', vi: 'Cần băng thông cao để phát video trực tuyến.' }]
  },
  {
    word: 'Encryption', translation: 'Mã hóa', ipa: '/ɪnˈkrɪp.ʃən/', partOfSpeech: 'noun', tags: ['IT', 'Cybersecurity'],
    examples: [{ en: 'End-to-end encryption protects your messages.', vi: 'Mã hóa đầu cuối bảo vệ tin nhắn của bạn.' }]
  },
  {
    word: 'Debugging', translation: 'Gỡ lỗi', ipa: '/ˌdiːˈbʌɡ.ɪŋ/', partOfSpeech: 'noun', tags: ['IT', 'Software Engineering'],
    examples: [{ en: 'I spent hours debugging the code.', vi: 'Tôi đã dành nhiều giờ để gỡ lỗi mã nguồn.' }]
  },
  {
    word: 'Framework', translation: 'Khuôn khổ/Nền tảng', ipa: '/ˈfreɪm.wɜːk/', partOfSpeech: 'noun', tags: ['IT', 'Software Engineering'],
    examples: [{ en: 'React is a popular JavaScript framework.', vi: 'React là một nền tảng JavaScript phổ biến.' }]
  },
  {
    word: 'Scalability', translation: 'Khả năng mở rộng', ipa: '/ˌskeɪ.ləˈbɪl.ə.ti/', partOfSpeech: 'noun', tags: ['IT', 'Architecture'],
    examples: [{ en: 'The system was designed with scalability in mind.', vi: 'Hệ thống được thiết kế với mục tiêu có thể mở rộng.' }]
  },
  {
    word: 'Latency', translation: 'Độ trễ', ipa: '/ˈleɪ.tən.si/', partOfSpeech: 'noun', tags: ['IT', 'Networking'],
    examples: [{ en: 'Low latency is crucial for online gaming.', vi: 'Độ trễ thấp là điều cốt yếu đối với game trực tuyến.' }]
  },
  {
    word: 'Repository', translation: 'Kho chứa mã nguồn', ipa: '/rɪˈpɒz.ɪ.tər.i/', partOfSpeech: 'noun', tags: ['IT', 'Software Engineering'],
    examples: [{ en: 'Please commit your changes to the repository.', vi: 'Vui lòng commit các thay đổi của bạn lên kho chứa.' }]
  },
  {
    word: 'Authentication', translation: 'Xác thực', ipa: '/ɔːˌθen.tɪˈkeɪ.ʃən/', partOfSpeech: 'noun', tags: ['IT', 'Security'],
    examples: [{ en: 'Two-factor authentication adds an extra layer of security.', vi: 'Xác thực hai yếu tố thêm một lớp bảo mật phụ.' }]
  },

  // --- Business & Finance ---
  {
    word: 'Revenue', translation: 'Doanh thu', ipa: '/ˈrev.ən.juː/', partOfSpeech: 'noun', tags: ['Business', 'Finance'],
    examples: [{ en: 'The company reported a massive increase in revenue.', vi: 'Công ty đã báo cáo sự gia tăng lớn về doanh thu.' }]
  },
  {
    word: 'Liability', translation: 'Nợ phải trả / Trách nhiệm pháp lý', ipa: '/ˌlaɪ.əˈbɪl.ə.ti/', partOfSpeech: 'noun', tags: ['Business', 'Finance'],
    examples: [{ en: 'The business has more assets than liabilities.', vi: 'Doanh nghiệp có nhiều tài sản hơn nợ phải trả.' }]
  },
  {
    word: 'Inflation', translation: 'Lạm phát', ipa: '/ɪnˈfleɪ.ʃən/', partOfSpeech: 'noun', tags: ['Finance', 'Economics'],
    examples: [{ en: 'High inflation reduces purchasing power.', vi: 'Lạm phát cao làm giảm sức mua.' }]
  },
  {
    word: 'Dividend', translation: 'Cổ tức', ipa: '/ˈdɪv.ɪ.dend/', partOfSpeech: 'noun', tags: ['Finance', 'Investment'],
    examples: [{ en: 'Shareholders receive a dividend at the end of the year.', vi: 'Các cổ đông nhận được cổ tức vào cuối năm.' }]
  },
  {
    word: 'Liquidity', translation: 'Tính thanh khoản', ipa: '/lɪˈkwɪd.ə.ti/', partOfSpeech: 'noun', tags: ['Finance'],
    examples: [{ en: 'The bank must maintain sufficient liquidity.', vi: 'Ngân hàng phải duy trì đủ tính thanh khoản.' }]
  },
  {
    word: 'Stakeholder', translation: 'Bên liên quan', ipa: '/ˈsteɪkˌhəʊl.dər/', partOfSpeech: 'noun', tags: ['Business', 'Management'],
    examples: [{ en: 'All stakeholders must agree to the new terms.', vi: 'Tất cả các bên liên quan phải đồng ý với các điều khoản mới.' }]
  },
  {
    word: 'Monopoly', translation: 'Độc quyền', ipa: '/məˈnɒp.əl.i/', partOfSpeech: 'noun', tags: ['Business', 'Economics'],
    examples: [{ en: 'The government broke up the telecom monopoly.', vi: 'Chính phủ đã phá vỡ thế độc quyền viễn thông.' }]
  },
  {
    word: 'Outsource', translation: 'Thuê ngoài', ipa: '/ˈaʊt.sɔːs/', partOfSpeech: 'verb', tags: ['Business', 'Management'],
    examples: [{ en: 'Many companies outsource their customer service.', vi: 'Nhiều công ty thuê ngoài dịch vụ khách hàng của họ.' }]
  },
  {
    word: 'Merger', translation: 'Sáp nhập', ipa: '/ˈmɜː.dʒər/', partOfSpeech: 'noun', tags: ['Business', 'Corporate'],
    examples: [{ en: 'The merger between the two banks was successful.', vi: 'Sự sáp nhập giữa hai ngân hàng đã thành công.' }]
  },
  {
    word: 'Acquisition', translation: 'Mua lại', ipa: '/ˌæk.wɪˈzɪʃ.ən/', partOfSpeech: 'noun', tags: ['Business', 'Corporate'],
    examples: [{ en: 'The acquisition of the startup cost $1 billion.', vi: 'Việc mua lại công ty khởi nghiệp tốn 1 tỷ đô la.' }]
  },

  // --- Healthcare & Medicine ---
  {
    word: 'Diagnosis', translation: 'Chẩn đoán', ipa: '/ˌdaɪ.əɡˈnəʊ.sɪs/', partOfSpeech: 'noun', tags: ['Healthcare', 'Medicine'],
    examples: [{ en: 'The doctor made an accurate diagnosis.', vi: 'Bác sĩ đã đưa ra một chẩn đoán chính xác.' }]
  },
  {
    word: 'Prescription', translation: 'Đơn thuốc', ipa: '/prɪˈskrɪp.ʃən/', partOfSpeech: 'noun', tags: ['Healthcare', 'Medicine'],
    examples: [{ en: 'You need a prescription to buy this medicine.', vi: 'Bạn cần đơn thuốc để mua loại thuốc này.' }]
  },
  {
    word: 'Symptoms', translation: 'Triệu chứng', ipa: '/ˈsɪmp.təm/', partOfSpeech: 'noun', tags: ['Healthcare', 'Medicine'],
    examples: [{ en: 'Fever and cough are common symptoms of the flu.', vi: 'Sốt và ho là những triệu chứng phổ biến của bệnh cúm.' }]
  },
  {
    word: 'Surgery', translation: 'Phẫu thuật', ipa: '/ˈsɜː.dʒər.i/', partOfSpeech: 'noun', tags: ['Healthcare', 'Medicine'],
    examples: [{ en: 'He will undergo heart surgery tomorrow.', vi: 'Anh ấy sẽ trải qua ca phẫu thuật tim vào ngày mai.' }]
  },
  {
    word: 'Vaccination', translation: 'Tiêm chủng', ipa: '/ˌvæk.sɪˈneɪ.ʃən/', partOfSpeech: 'noun', tags: ['Healthcare', 'Medicine'],
    examples: [{ en: 'Vaccination helps prevent the spread of diseases.', vi: 'Tiêm chủng giúp ngăn ngừa sự lây lan của bệnh tật.' }]
  },
  {
    word: 'Antibiotic', translation: 'Thuốc kháng sinh', ipa: '/ˌæn.ti.baɪˈɒt.ɪk/', partOfSpeech: 'noun', tags: ['Healthcare', 'Medicine'],
    examples: [{ en: 'The doctor prescribed an antibiotic for the infection.', vi: 'Bác sĩ kê đơn thuốc kháng sinh cho chỗ nhiễm trùng.' }]
  },
  {
    word: 'Immunity', translation: 'Khả năng miễn dịch', ipa: '/ɪˈmjuː.nə.ti/', partOfSpeech: 'noun', tags: ['Healthcare', 'Medicine'],
    examples: [{ en: 'The vaccine provides lifelong immunity.', vi: 'Vắc xin cung cấp khả năng miễn dịch suốt đời.' }]
  },
  {
    word: 'Therapy', translation: 'Liệu pháp / Điều trị', ipa: '/ˈθer.ə.pi/', partOfSpeech: 'noun', tags: ['Healthcare', 'Medicine'],
    examples: [{ en: 'Physical therapy helped him recover from the injury.', vi: 'Vật lý trị liệu giúp anh ấy phục hồi sau chấn thương.' }]
  },
  {
    word: 'Epidemic', translation: 'Bệnh dịch', ipa: '/ˌep.ɪˈdem.ɪk/', partOfSpeech: 'noun', tags: ['Healthcare', 'Medicine'],
    examples: [{ en: 'The flu epidemic affected thousands of people.', vi: 'Dịch cúm đã ảnh hưởng đến hàng ngàn người.' }]
  },
  {
    word: 'Chronic', translation: 'Mãn tính', ipa: '/ˈkrɒn.ɪk/', partOfSpeech: 'adj', tags: ['Healthcare', 'Medicine'],
    examples: [{ en: 'She suffers from chronic back pain.', vi: 'Cô ấy bị đau lưng mãn tính.' }]
  },

  // --- Marketing & Communications ---
  {
    word: 'Campaign', translation: 'Chiến dịch', ipa: '/kæmˈpeɪn/', partOfSpeech: 'noun', tags: ['Marketing', 'Communications'],
    examples: [{ en: 'The new advertising campaign was highly successful.', vi: 'Chiến dịch quảng cáo mới đã rất thành công.' }]
  },
  {
    word: 'Demographic', translation: 'Nhân khẩu học', ipa: '/ˌdem.əˈɡræf.ɪk/', partOfSpeech: 'noun', tags: ['Marketing', 'Research'],
    examples: [{ en: 'The target demographic is young adults aged 18-25.', vi: 'Nhóm nhân khẩu học mục tiêu là thanh niên từ 18-25 tuổi.' }]
  },
  {
    word: 'Branding', translation: 'Xây dựng thương hiệu', ipa: '/ˈbræn.dɪŋ/', partOfSpeech: 'noun', tags: ['Marketing', 'Design'],
    examples: [{ en: 'Good branding makes your company easily recognizable.', vi: 'Việc xây dựng thương hiệu tốt giúp công ty bạn dễ dàng được nhận diện.' }]
  },
  {
    word: 'Engagement', translation: 'Sự tương tác', ipa: '/ɪnˈɡeɪdʒ.mənt/', partOfSpeech: 'noun', tags: ['Marketing', 'Social Media'],
    examples: [{ en: 'We need to increase user engagement on our social media.', vi: 'Chúng ta cần tăng cường sự tương tác của người dùng trên mạng xã hội.' }]
  },
  {
    word: 'Conversion', translation: 'Chuyển đổi', ipa: '/kənˈvɜː.ʃən/', partOfSpeech: 'noun', tags: ['Marketing', 'Sales'],
    examples: [{ en: 'The website redesign led to a higher conversion rate.', vi: 'Việc thiết kế lại trang web dẫn đến tỷ lệ chuyển đổi cao hơn.' }]
  },
  {
    word: 'Niche', translation: 'Thị trường ngách', ipa: '/niːʃ/', partOfSpeech: 'noun', tags: ['Marketing', 'Strategy'],
    examples: [{ en: 'They found a profitable niche in the organic food market.', vi: 'Họ đã tìm thấy một thị trường ngách béo bở trong thị trường thực phẩm hữu cơ.' }]
  },
  {
    word: 'Promotion', translation: 'Khuyến mãi / Thúc đẩy', ipa: '/prəˈməʊ.ʃən/', partOfSpeech: 'noun', tags: ['Marketing', 'Sales'],
    examples: [{ en: 'The special promotion runs until the end of the month.', vi: 'Chương trình khuyến mãi đặc biệt kéo dài đến cuối tháng.' }]
  },
  {
    word: 'Sponsorship', translation: 'Tài trợ', ipa: '/ˈspɒn.sə.ʃɪp/', partOfSpeech: 'noun', tags: ['Marketing', 'Communications'],
    examples: [{ en: 'The event was made possible through corporate sponsorship.', vi: 'Sự kiện được tổ chức nhờ vào sự tài trợ của các doanh nghiệp.' }]
  },

  // --- Law & Legal ---
  {
    word: 'Litigation', translation: 'Kiện tụng', ipa: '/ˌlɪt.ɪˈɡeɪ.ʃən/', partOfSpeech: 'noun', tags: ['Law', 'Legal'],
    examples: [{ en: 'The dispute was settled without litigation.', vi: 'Tranh chấp đã được giải quyết mà không cần kiện tụng.' }]
  },
  {
    word: 'Jurisdiction', translation: 'Quyền tài phán', ipa: '/ˌdʒʊə.rɪsˈdɪk.ʃən/', partOfSpeech: 'noun', tags: ['Law', 'Legal'],
    examples: [{ en: 'The court does not have jurisdiction over this case.', vi: 'Tòa án không có quyền tài phán đối với vụ án này.' }]
  },
  {
    word: 'Verdict', translation: 'Phán quyết', ipa: '/ˈvɜː.dɪkt/', partOfSpeech: 'noun', tags: ['Law', 'Legal'],
    examples: [{ en: 'The jury reached a guilty verdict.', vi: 'Bồi thẩm đoàn đã đưa ra phán quyết có tội.' }]
  },
  {
    word: 'Testimony', translation: 'Lời khai', ipa: '/ˈtes.tɪ.mən.i/', partOfSpeech: 'noun', tags: ['Law', 'Legal'],
    examples: [{ en: 'The witness gave a compelling testimony.', vi: 'Nhân chứng đã đưa ra một lời khai thuyết phục.' }]
  },
  {
    word: 'Defendant', translation: 'Bị cáo', ipa: '/dɪˈfen.dənt/', partOfSpeech: 'noun', tags: ['Law', 'Legal'],
    examples: [{ en: 'The defendant was found not guilty.', vi: 'Bị cáo được tuyên vô tội.' }]
  },
  {
    word: 'Plaintiff', translation: 'Nguyên đơn', ipa: '/ˈpleɪn.tɪf/', partOfSpeech: 'noun', tags: ['Law', 'Legal'],
    examples: [{ en: 'The plaintiff is suing for damages.', vi: 'Nguyên đơn đang kiện đòi bồi thường thiệt hại.' }]
  },
  {
    word: 'Affidavit', translation: 'Bản khai có tuyên thệ', ipa: '/ˌæf.əˈdeɪ.vɪt/', partOfSpeech: 'noun', tags: ['Law', 'Legal'],
    examples: [{ en: 'He submitted an affidavit supporting the claim.', vi: 'Anh ta đã nộp một bản khai có tuyên thệ để hỗ trợ cho yêu cầu bồi thường.' }]
  },
  {
    word: 'Contract', translation: 'Hợp đồng', ipa: '/ˈkɒn.trækt/', partOfSpeech: 'noun', tags: ['Law', 'Legal'],
    examples: [{ en: 'Both parties signed the contract.', vi: 'Cả hai bên đã ký hợp đồng.' }]
  }
];

async function main() {
  console.log('Clearing existing flashcards to prevent duplicates during testing...');
  // Optional: We won't clear existing vocab to preserve user's own data, just add new ones.
  
  let addedCount = 0;

  for (const item of vocabData) {
    // Check if word already exists to prevent duplicate insertion
    const existing = await prisma.vocabularyItem.findFirst({
      where: {
        userId: ADMIN_USER_ID,
        word: item.word
      }
    });

    if (!existing) {
      await prisma.vocabularyItem.create({
        data: {
          userId: ADMIN_USER_ID,
          word: item.word,
          translation: item.translation,
          ipa: item.ipa,
          partOfSpeech: item.partOfSpeech,
          sourceLang: 'en',
          targetLang: 'vi',
          tags: item.tags,
          difficulty: 3,
          examples: item.examples,
          flashcardSession: {
            create: {
              userId: ADMIN_USER_ID,
              score: 0,
              easeFactor: 2.5,
              intervalDays: 1,
              nextReviewDate: new Date(),
            }
          }
        }
      });
      addedCount++;
      console.log(`+ Added: ${item.word} (${item.tags[0]})`);
    } else {
      console.log(`~ Skipped (Already exists): ${item.word}`);
    }
  }

  console.log(`\nImport completed! Successfully added ${addedCount} new words across 5 professions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
