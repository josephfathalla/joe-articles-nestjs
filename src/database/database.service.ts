import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  private static instance: PrismaClient;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });

    // Store instance for Better Auth adapter
    DatabaseService.instance = this;
  }

  static getInstance(): PrismaClient {
    return DatabaseService.instance;
  }

  async onModuleInit() {
    await this.$connect();
  }
}
