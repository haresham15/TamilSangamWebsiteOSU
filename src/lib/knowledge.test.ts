import { describe, it, expect } from "vitest";
import { saveKnowledgeItem, getKnowledgeBase, deleteKnowledgeItem } from "./knowledge";

describe("Knowledge Base Unit Tests", () => {
  it("saves, retrieves and deletes knowledge items correctly", async () => {
    const testId = `kb-test-${Date.now()}`;
    const item = await saveKnowledgeItem({
      id: testId,
      titleEn: "Test Title",
      contentEn: "Test Content",
    });

    expect(item).toBeDefined();
    expect(item.id).toBe(testId);
    expect(item.titleEn).toBe("Test Title");

    const kb = getKnowledgeBase();
    const found = kb.find((k) => k.id === testId);
    expect(found).toBeDefined();
    expect(found?.contentEn).toBe("Test Content");

    const deleted = await deleteKnowledgeItem(testId);
    expect(deleted).toBe(true);

    const kbAfter = getKnowledgeBase();
    expect(kbAfter.find((k) => k.id === testId)).toBeUndefined();
  });
});
