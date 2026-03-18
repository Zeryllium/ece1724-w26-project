import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth, isManaging, ROLES } from "@/lib/auth";

export async function POST(request: NextRequest) {
  // ensure user is logged in
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // safely extract lrs secrets from env
  const lrsEndpoint = process.env.LRS_ENDPOINT;
  const lrsKey = process.env.LRS_KEY;
  const lrsSecret = process.env.LRS_SECRET;

  if (!lrsEndpoint || !lrsKey || !lrsSecret) {
    console.error("LRS variables are not configured in the environment.");
    return NextResponse.json({ error: "LRS capability is currently disabled." }, { status: 503 });
  }

  try {
    // pull out the frontend's xAPI payload
    const statement = await request.json();

    // build basic auth header for external api
    const authString = Buffer.from(`${lrsKey}:${lrsSecret}`).toString('base64');

    // forward straight to LRS
    const targetUrl = lrsEndpoint.endsWith('/statements') ? lrsEndpoint : (lrsEndpoint.endsWith('/') ? `${lrsEndpoint}statements` : `${lrsEndpoint}/statements`);
    const lrsResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
        'X-Experience-API-Version': '1.0.3'
      },
      body: JSON.stringify(statement)
    });

    if (!lrsResponse.ok) {
        const errorText = await lrsResponse.text();
        console.error(`LRS Error (${lrsResponse.status}): ${errorText}`);
        return NextResponse.json({ error: "Failed to forward statement to LRS" }, { status: lrsResponse.status });
    }

    // parse LRS response and send it back to client
    const data = await lrsResponse.json();
    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (error) {
    console.error("LRS Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // drop unauthenticated users
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // extract routing info from query
  const searchParams = request.nextUrl.searchParams;
  const courseId = searchParams.get("courseId");
  const moduleId = searchParams.get("moduleId");

  if (!courseId || !moduleId) {
    return NextResponse.json({ error: "Missing courseId or moduleId parameters" }, { status: 400 });
  }

  // make sure the user actual owns this course or is a site admin
  const role = (session.user as any).role;
  const _isManaging = await isManaging(session.user.id, courseId);

  if (!_isManaging && role !== ROLES.ADMIN) {
    return NextResponse.json({ error: "Forbidden: You do not manage this course" }, { status: 403 });
  }

  // pull required lrs configs from env vars
  const lrsEndpoint = process.env.LRS_ENDPOINT;
  const lrsKey = process.env.LRS_KEY;
  const lrsSecret = process.env.LRS_SECRET;

  if (!lrsEndpoint || !lrsKey || !lrsSecret) {
    console.error("LRS variables are not configured in the environment.");
    return NextResponse.json({ error: "LRS capability is currently disabled." }, { status: 503 });
  }

  try {
    // put together basic auth key
    const authString = Buffer.from(`${lrsKey}:${lrsSecret}`).toString('base64');
    
    // target the specific course module URI in LRS
    const activityId = encodeURIComponent(`http://ece1724.local/course/${courseId}/module/${moduleId}`);

    // hit up the statements endpoint, fetching sub-activities too
    const baseUrl = lrsEndpoint.endsWith('/statements') ? lrsEndpoint : (lrsEndpoint.endsWith('/') ? `${lrsEndpoint}statements` : `${lrsEndpoint}/statements`);
    const targetUrl = `${baseUrl}?activity=${activityId}&related_activities=true`;

    const lrsResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'X-Experience-API-Version': '1.0.3'
      }
    });

    if (!lrsResponse.ok) {
        const errorText = await lrsResponse.text();
        console.error(`LRS Error (${lrsResponse.status}): ${errorText}`);
        return NextResponse.json({ error: "Failed to fetch statements from LRS" }, { status: lrsResponse.status });
    }

    const data = await lrsResponse.json();
    return NextResponse.json({ success: true, statements: data.statements || [] }, { status: 200 });

  } catch (error) {
    console.error("LRS Proxy GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
