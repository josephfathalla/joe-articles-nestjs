import { betterAuth } from 'better-auth';
import { openAPI } from 'better-auth/plugins';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { DatabaseService } from './database/database.service';

// import sgMail from '@sendgrid/mail'; // Uncomment when ready

// Helper function for sending emails (uncomment when ready)
// const sendEmail = async (to: string, subject: string, html: string, text: string) => {
//   sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
//   await sgMail.send({
//     from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
//     to,
//     subject,
//     html,
//     text,
//   });
// };

export const createAuth = (databaseService: DatabaseService) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  return {
    auth: betterAuth({
      baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
      // Add trustedOrigins - this is REQUIRED for Better Auth to work properly
      trustedOrigins: [
        process.env.BETTER_AUTH_URL || 'http://localhost:3000',
        'http://localhost:3000',
        // Add your frontend URL(s) here if different
        // 'http://localhost:5173', // Example: Vite dev server
      ],
      secret:
        process.env.BETTER_AUTH_SECRET || 'your-secret-key-min-32-chars-long',
      database: prismaAdapter(databaseService, {
        provider: 'postgresql',
      }),
      emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        requireEmailVerification: false,
      },
      emailVerification: {
        enabled: true,
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
          if (isDevelopment) {
            // Development: Log to console
            console.log('\n📧 ===== VERIFICATION EMAIL =====');
            console.log(`To: ${user.email}`);
            console.log(`Subject: Verify your email address`);
            console.log(`Verification URL: ${url}`);
            console.log('===================================\n');
          } else {
            // Production: Send via SendGrid
            // await sendEmail(
            //   user.email,
            //   'Verify your email address',
            //   `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
            //   `Click the link to verify your email: ${url}`,
            // );
          }
        },
      },
      email: {
        sendPasswordReset: async ({ user, url }) => {
          if (isDevelopment) {
            // Development: Log to console
            console.log('\n📧 ===== PASSWORD RESET EMAIL =====');
            console.log(`To: ${user.email}`);
            console.log(`Subject: Reset your password`);
            console.log(`Reset URL: ${url}`);
            console.log('===================================\n');
          } else {
            // Production: Send via SendGrid
            // await sendEmail(
            //   user.email,
            //   'Reset your password',
            //   `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
            //   `Click the link to reset your password: ${url}`,
            // );
          }
        },
      },
      plugins: [openAPI()],
    }),
  };
};
