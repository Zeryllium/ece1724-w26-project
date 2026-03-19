import { PutObjectCommand } from "@aws-sdk/client-s3";
import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { s3Client } from "@/lib/s3-client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {auth} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {SubmissionStatus, SubmissionType} from "@/generated/prisma/enums";

export async function POST(req: NextRequest) {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = reqHeaders.get("content-type");
  if (!contentType || !contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Invalid content type" },
      { status: 400 },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const uploadType = formData.get("uploadType") as string;
    const moduleId = formData.get("moduleId") as string;
    const userId = session.user.id

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!uploadType || (uploadType !== "MODULE" && uploadType !== "SUBMISSION")) {
      return NextResponse.json({ error: "File does not have a matching upload type"}, { status: 400 });
    } else if (!moduleId || moduleId.trim() === "") {
      return NextResponse.json({error: "File upload does not have a valid moduleId"}, {status: 400});
    }

    try {
      await prisma.module.findUniqueOrThrow({
        where: {
          moduleId
        }
      })
    } catch {
      return NextResponse.json({error: "File upload does not have a valid moduleId"}, {status: 400});
    }

    const fileId = crypto.randomUUID();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const key = `uploads/users/${userId}/${fileId}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: file.type || "application/octet-stream",
    });

    const signedUrl = await getSignedUrl(s3Client, command, {expiresIn:300});

    const fileTransaction = await prisma.$transaction(async (tx) => {
      let newFile = null
      if (uploadType === "MODULE") {
        newFile = await tx.file.create({
          data: {
            s3Path: key,
            originalName: file.name,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            uploaderId: session.user.id,
            moduleId: moduleId
          }
        })
      } else {
        const submissionUpsert = await tx.submission.upsert({
          where: {
            studentId_moduleId: {
              studentId: session.user.id,
              moduleId: moduleId
            }
          },
          update: {
            submissionStatus: SubmissionStatus.INCOMPLETE
          },
          create: {
            studentId: session.user.id,
            moduleId: moduleId,
            submissionStatus: SubmissionStatus.INCOMPLETE,
            submissionGrade: 0,
            submissionType: SubmissionType.FILE,
          }
        })

        newFile = await tx.file.create({
          data: {
            s3Path: key,
            originalName: file.name,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            uploaderId: session.user.id,
            submissionId: submissionUpsert.id
          }
        })
      }
      return newFile;
    })

    console.log(fileTransaction.id)

    return NextResponse.json({ signedUrl, key, fileId });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}