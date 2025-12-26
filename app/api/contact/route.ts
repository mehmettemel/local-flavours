import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import ContactSubmissionEmail from '@/components/emails/contact-submission';

export async function POST(request: Request) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'E-posta servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.' },
        { status: 503 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await request.json();
    const { name, email, subject, category, message, website } = body;

    // Spam check (Honeypot)
    if (website && website.length > 0) {
      // Silently reject spam
      console.log('Spam detected (honeypot filled):', { name, email, website });
      return NextResponse.json({ success: true });
    }

    // Validate required fields
    if (!name || !email || !subject || !category || !message) {
      return NextResponse.json(
        { error: 'Tüm alanların doldurulması zorunludur.' },
        { status: 400 }
      );
    }

    // Send email
    const data = await resend.emails.send({
      from: 'Mekan.guru İletişim <onboarding@resend.dev>', // Verify your domain to use noreply@mekan.guru
      to: ['temel.dev1@gmail.com'],
      subject: `[Mekan.guru] Yeni Mesaj: ${subject}`,
      react: ContactSubmissionEmail({
        name,
        email,
        subject,
        category,
        message,
        sentAt: new Date().toLocaleString('tr-TR'),
      }),
      replyTo: email,
    });

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  }
}
