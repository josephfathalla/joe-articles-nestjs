import { betterAuth } from 'better-auth';
import { openAPI } from 'better-auth/plugins';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { DatabaseService } from './database/database.service';

export const createAuth = (databaseService: DatabaseService) => {
  return {
    auth: betterAuth({
      database: prismaAdapter(databaseService, {
        provider: 'postgresql',
      }),
      emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
      },
      plugins: [openAPI()],
    }),
  };
};
