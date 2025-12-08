import { render } from '@react-email/render';
import AuthVerificationEmail from '../components/emails/auth-verification';
import * as fs from 'fs';
import * as path from 'path';
import React from 'react';

// Polyfill for Node.js < 17
if (!global.structuredClone) {
  global.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
}

async function main() {
  const emailHtml = await render(<AuthVerificationEmail confirmationLink="{{ .ConfirmationURL }}" />);
  
  const outputPath = path.join(process.cwd(), 'auth-email.html');
  fs.writeFileSync(outputPath, emailHtml);
  
  console.log(`Email HTML generated at: ${outputPath}`);
}

main().catch(console.error);
