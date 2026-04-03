import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

export async function POST(request: NextRequest, props: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await props.params;

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Locate existing Google OAuth tokens stored by better-auth
  const googleAccount = await prisma.account.findFirst({
    where: { 
      userId: session.user.id, 
      providerId: "google" 
    }
  });

  if (!googleAccount || (!googleAccount.refreshToken && !googleAccount.accessToken)) {
    return NextResponse.json({ error: "Google_Account_Not_Linked" }, { status: 403 });
  }

  // Instantiate standard googleapis backend handler
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/api/auth/callback/google"
  );

  oauth2Client.setCredentials({
    access_token: googleAccount.accessToken,
    refresh_token: googleAccount.refreshToken || null,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  try {
     const course = await prisma.course.findUnique({
       where: { courseId },
       include: { modules: true }
     });

     if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
     }

     let syncedCount = 0;
     for (const mod of course.modules) {
        let dueDateStr = null;
        if (mod.moduleType === "ASSIGNMENT" && (mod.assignmentConfig as any)?.dueDate) {
           dueDateStr = (mod.assignmentConfig as any).dueDate;
        } else if (mod.moduleType === "QUIZ" && (mod.quizConfig as any)?.dueDate) {
           dueDateStr = (mod.quizConfig as any).dueDate;
        }

        if (dueDateStr) {
           const startDate = new Date(dueDateStr);
           const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Pad +1 hour duration for generic block
           
           await calendar.events.insert({
             calendarId: "primary",
             requestBody: {
               summary: `[${course.courseName}] Due: ${mod.moduleTitle}`,
               description: `${mod.moduleDescription}\n\nView module exactly here: http://localhost:3000/courses/${course.courseId}/module/${mod.moduleIndex}`,
               start: { dateTime: startDate.toISOString() },
               end: { dateTime: endDate.toISOString() }
             }
           });
           syncedCount++;
        }
     }

     return NextResponse.json({ message: `Successfully synced ${syncedCount} active course deadlines to your Google Calendar.` });
  } catch (error: any) {
     console.error("Google Calendar Sync Error:", error);
     
     // Detect scope mismatch and report as 403 to trigger front-end re-link
     if (error.code === 403 || error.status === 403 || error.message?.includes("insufficient authentication scopes")) {
        return NextResponse.json({ error: "Google_Insufficient_Scopes" }, { status: 403 });
     }
     
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
