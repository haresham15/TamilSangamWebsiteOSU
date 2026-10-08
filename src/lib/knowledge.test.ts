import assert from "node:assert/strict";
import fs from "fs";
import { saveKnowledgeItem } from "./knowledge";

console.log("=== Running Knowledge Base Tests ===");

// 1. Test saveKnowledgeItem error handling
const originalWriteFileSync = fs.writeFileSync;
let warningLogged = false;
const originalConsoleWarn = console.warn;

console.warn = (...args) => {
  if (args[0] === "[KnowledgeBase] Unable to persist to disk:") {
    warningLogged = true;
  }
};

try {
  // Mock writeFileSync to throw an error (simulating disk full, permission denied, or quota exceeded)
  fs.writeFileSync = () => {
    throw new Error("Mock disk full or permission denied (QuotaExceededError equivalent)");
  };

  const item = saveKnowledgeItem({
    titleEn: "Test Title",
    contentEn: "Test Content",
  });

  assert.ok(item, "saveKnowledgeItem should return the item even if disk save fails");
  assert.equal(item.titleEn, "Test Title");
  assert.equal(warningLogged, true, "saveKnowledgeItem should log a warning when disk save fails");
  console.log("1. saveKnowledgeItem Error Handling: PASS (Graceful failure confirmed)");
} finally {
  // Restore original functions
  fs.writeFileSync = originalWriteFileSync;
  console.warn = originalConsoleWarn;
}

console.log("=== All Knowledge Base Tests Passed Cleanly ===");
