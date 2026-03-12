import { auth, ROLES } from "@/lib/auth"
import { headers } from "next/headers"

import {NextRequest, NextResponse} from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // Fetch all information pertaining to this account
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return NextResponse.json(
      {
        error: "Unauthorized"
      },
      {
        status: 401
      }
    )
  }

  try {
    const user = await prisma.user.findFirstOrThrow({
      where: {
        userId: session.user.id
      },
      include: {
        enrollments: {
          orderBy: {
            courseId: "asc"
          }
        }
      }
    });
    return NextResponse.json(user)

  } catch {
    return NextResponse.json(
      {
        error: "User Not Found"
      },
      {
        status: 404
      }
    )
  }
}
