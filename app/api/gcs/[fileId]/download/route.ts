import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3-client";
import { prisma } from "@/lib/prisma";
import {headers} from "next/headers";
import {auth, ROLES} from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  const {fileId} = await params

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const file = await prisma.file.findUnique({
      where: {
        id: fileId
      },
      include: {
        module: true,
        submission: true
      }
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // We need to locate the CourseId
    // File either has a Module relationship or a Submission relationship
    // Submission has a relationship with Module
    // Check File->Module->Course first and then fallback on File->Submission->Module->Course

    let targetCourseId = file.module?.courseId;
    if (!targetCourseId && file.submission) {
      const submissionModule = await prisma.module.findUnique({
        where: {
          moduleId: file.submission.moduleId
        }
      });
      targetCourseId = submissionModule?.courseId;
    }

    if (!targetCourseId) {
      return NextResponse.json({ error: "Malformed Course ID" }, { status: 409 })
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: targetCourseId
        }
      }
    })
    const management = await prisma.managing.findUnique({
      where: {
        instructorId_courseId: {
          instructorId: session.user.id,
          courseId: targetCourseId
        }
      }
    })

    if (!enrollment && !management && session.user.role !== ROLES.ADMIN) {
      return NextResponse.json( {error: "You are not enrolled in this course"}, { status: 403 } )
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.s3Path,
      ResponseContentDisposition: `attachment; filename="${file.originalName}"`,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    console.log(signedUrl)

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}