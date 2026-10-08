import assert from "node:assert/strict";
import fs from "fs";
import { saveKnowledgeItem } from "./knowledge";

export async function runKnowledgeUnitTests() {
  console.log("=== Running Knowledge Base Tests ===");

  const originalWriteFile = fs.promises.writeFile;
  let warningLogged = false;
  const originalConsoleWarn = console.warn;

  console.warn = (...args: unknown[]) => {
    if (args[0] === "[KnowledgeBase] Unable to persist to disk:") {
      warningLogged = true;
    }
  };

  try {
    fs.promises.writeFile = async () => {
      throw new Error("Mock disk full or permission denied (QuotaExceededError equivalent)");
    };

    const item = await saveKnowledgeItem({
      titleEn: "Test Title",
      contentEn: "Test Content",
    });

    assert.ok(item, "saveKnowledgeItem should return the item even if disk save fails");
    assert.equal(item.titleEn, "Test Title");
    assert.equal(warningLogged, true, "saveKnowledgeItem should log a warning when disk save fails");
    console.log("1. saveKnowledgeItem Error Handling: PASS (Graceful failure confirmed)");
  } finally {
    fs.promises.writeFile = originalWriteFile;
    console.warn = originalConsoleWarn;
  }

  console.log("=== All Knowledge Base Tests Passed Cleanly ===");
}
