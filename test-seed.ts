import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true }
});

async function main() {
  console.log("Setting up Demo instructor account...");
  const email = "demo_instructor@test.com";

  // Clean up
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    await prisma.user.update({ where: { id: existingUser.id }, data: { role: "INSTRUCTOR" } });
    console.log("Demo Instructor already exists, reused.");
    return;
  }

  // Create
  const res = await auth.api.signUpEmail({
    body: {
      email,
      password: "password123",
      name: "Demo Instructor",
    }
  }).catch(async () => {
    return await prisma.user.findUnique({ where: { email }});
  });

  const userId = (res as any)?.user?.id || (res as any)?.id;
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: "INSTRUCTOR" }
    });
    console.log("Demo Instructor setup complete.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
