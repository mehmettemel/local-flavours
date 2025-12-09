import { render } from '@react-email/render';
import AuthVerificationEmail from '../components/emails/auth-verification';
import PasswordResetEmail from '../components/emails/password-reset';
import * as fs from 'fs';
import * as path from 'path';

async function generateEmails() {
  const outputDir = path.join(__dirname, 'output');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate Auth Verification Email
  const authVerificationHtml = await render(
    AuthVerificationEmail({
      confirmationLink: '{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup',
      username: '{{ .Email }}',
    })
  );

  fs.writeFileSync(
    path.join(outputDir, 'auth-verification.html'),
    authVerificationHtml
  );

  console.log('✅ Auth verification email generated: scripts/output/auth-verification.html');

  // Generate Password Reset Email
  const passwordResetHtml = await render(
    PasswordResetEmail({
      resetLink: '{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery',
      username: '{{ .Email }}',
    })
  );

  fs.writeFileSync(
    path.join(outputDir, 'password-reset.html'),
    passwordResetHtml
  );

  console.log('✅ Password reset email generated: scripts/output/password-reset.html');

  console.log('\n📋 Copy these HTML files to Supabase Dashboard:');
  console.log('   - Auth Verification → Authentication → Email Templates → Confirm signup');
  console.log('   - Password Reset → Authentication → Email Templates → Reset password');
}

generateEmails().catch(console.error);
