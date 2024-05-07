import { NextRequest, NextResponse } from "next/server";
import { getDocs, getSplitDocs, createVectorStore } from "@/utils/doc_utils";
export const runtime = "edge";

/**
 * Ingest URL
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = body.url;
  try {
    const docs = await getDocs(url);
    const splitDocs = await getSplitDocs(docs);
    const vectorstore = await createVectorStore(url, splitDocs);
    return NextResponse.json({ message: `${url} is uploaded` });
  }
  catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
