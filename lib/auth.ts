import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

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
  // advanced: {
  //   database: {
  //     generateId: false
  //   }
  // },
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: "offline",
      scope: [
        "openid",
        "https://www.googleapis.com/auth/userinfo.profile", 
        "https://www.googleapis.com/auth/userinfo.email", 
        "https://www.googleapis.com/auth/calendar.events"
      ]
    }
  },
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true
    }
  },
  plugins: [nextCookies()]
});

/**
 * Check if a userId, courseId pair is in the Managing table
 * @param userId
 * @param courseId
 */
export async function isManaging(userId:string, courseId:string) {
  try {
    return await prisma.managing.findUnique({
      where: {
        instructorId_courseId: {
          instructorId: userId,
          courseId: courseId
        }
      }
    }) !== null;
  } catch {
    // Invalid uuid string
    return null;
  }
}

/**
 * Check if a userId, courseId pair is in the Enrollment table
 * @param userId
 * @param courseId
 */
export async function isEnrolled(userId:string, courseId:string) {
  try {
    return await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId: courseId
        }
      }
    }) !== null;
  } catch {
    // Invalid uuid string
    return null;
  }
}