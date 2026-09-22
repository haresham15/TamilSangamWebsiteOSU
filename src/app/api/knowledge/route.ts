import { NextRequest, NextResponse } from "next/server";
import { getKnowledgeBase, saveKnowledgeItem, deleteKnowledgeItem } from "@/lib/knowledge";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = getKnowledgeBase();
    return NextResponse.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("[API Knowledge GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve knowledge base" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const { id, titleEn, titleTa, category, contentEn, contentTa, keywords, route } = body;

    if (!titleEn || typeof titleEn !== "string" || !titleEn.trim()) {
      return NextResponse.json(
        { success: false, error: "Title (English) is required" },
        { status: 400 }
      );
    }

    if (!contentEn || typeof contentEn !== "string" || !contentEn.trim()) {
      return NextResponse.json(
        { success: false, error: "Content (English) is required" },
        { status: 400 }
      );
    }

    const saved = saveKnowledgeItem({
      id,
      titleEn,
      titleTa,
      category,
      contentEn,
      contentTa,
      keywords: Array.isArray(keywords)
        ? keywords
        : typeof keywords === "string"
        ? keywords.split(",").map((k: string) => k.trim())
        : [],
      route: route || "/guide",
    });

    return NextResponse.json({
      success: true,
      item: saved,
      message: "Knowledge item successfully saved and indexed",
    });
  } catch (error) {
    console.error("[API Knowledge POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save knowledge item" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      );
    }

    const deleted = deleteKnowledgeItem(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Item not found or cannot delete baseline items" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Knowledge item ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("[API Knowledge DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete knowledge item" },
      { status: 500 }
    );
  }
}
