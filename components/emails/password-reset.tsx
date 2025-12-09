import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface PasswordResetEmailProps {
  resetLink: string;
  username?: string;
}

export default function PasswordResetEmail({
  resetLink = 'https://mekan.guru/auth/confirm?token_hash=...&type=recovery',
  username = 'Gezgin',
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>mekan.guru - Şifre sıfırlama bağlantınız</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src="https://www.mekan.guru/web-app-manifest-192x192.png"
                width="40"
                height="40"
                alt="mekan.guru"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Şifrenizi Sıfırlayın
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Merhaba <strong>{username}</strong>,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              mekan.guru hesabınız için bir şifre sıfırlama isteği aldık. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#f97316] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={resetLink}
              >
                Şifremi Sıfırla
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              veya aşağıdaki linki tarayıcınıza kopyalayın:
            </Text>
            <Link
              href={resetLink}
              className="text-[#f97316] no-underline break-all"
            >
              Bağlantıyı tarayıcıda aç
            </Link>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Bu bağlantı 24 saat içinde geçerliliğini yitirecektir. Eğer siz şifre sıfırlama talebinde bulunmadıysanız, bu mesajı görmezden gelebilirsiniz.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
