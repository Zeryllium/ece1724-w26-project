import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3-client";
import { prisma } from "@/lib/prisma";
import {headers} from "next/headers";
import {auth} from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const file = await prisma.file.findUnique({
      where: { id: params.fileId },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.s3Path,
      ResponseContentDisposition: `attachment; filename="${file.originalName}"`,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}