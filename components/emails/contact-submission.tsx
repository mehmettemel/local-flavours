import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface ContactSubmissionEmailProps {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  sentAt: string;
}

export default function ContactSubmissionEmail({
  name = 'Ahmet Yılmaz',
  email = 'ahmet@example.com',
  subject = 'Özellik Önerisi',
  category = 'feature',
  message = 'Harika bir uygulama olmuş, tebrikler! Şöyle bir özellik de ekleseniz süper olur...',
  sentAt = new Date().toLocaleString('tr-TR'),
}: ContactSubmissionEmailProps) {
  const categoryLabels: Record<string, string> = {
    general: 'Genel Soru',
    support: 'Teknik Destek',
    feature: 'Özellik Önerisi',
    bug: 'Hata Bildirimi',
    partnership: 'İş Birliği',
    other: 'Diğer',
  };

  return (
    <Html>
      <Head />
      <Preview>Yeni İletişim Formu Mesajı: {subject}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Yeni İletişim Mesajı
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>Gönderen:</strong> {name} ({email})
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>Kategori:</strong> {categoryLabels[category] || category}
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>Tarih:</strong> {sentAt}
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>Konu:</strong> {subject}
            </Text>
            <Section className="bg-[#f6f9fc] p-[20px] rounded-md mt-[16px]">
              <Text className="text-black text-[14px] leading-[24px] m-0">
                {message}
              </Text>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Bu mesaj mekan.guru iletişim formundan gönderilmiştir.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
