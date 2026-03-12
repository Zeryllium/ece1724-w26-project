import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({adapter});


export enum ROLES {
  STUDENT = "STUDENT",
  INSTRUCTOR = "INSTRUCTOR",
  ADMIN = "ADMIN"
}

export const auth = betterAuth({
  user: {
    additionalFields: {
      role: {
        type: [ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN],
        required: true,
        defaultValue: ROLES.STUDENT,
        input: false, // don't allow user to set role
      },
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    database: {
      generateId: "uuid"
    }
  }
});