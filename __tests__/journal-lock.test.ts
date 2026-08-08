import { describe, it, expect } from "vitest";

interface JournalState {
  title: string;
  content: string;
  isLocked: boolean;
}

function handleSaveJournal(
  inputTitle: string,
  inputContent: string,
  addEntryMock: (entry: { title?: string; content: string }) => void
): JournalState {
  if (!inputContent.trim()) {
    return { title: inputTitle, content: inputContent, isLocked: false };
  }

  addEntryMock({
    title: inputTitle.trim() || undefined,
    content: inputContent.trim(),
  });

  // Refresh inputs and set locked state
  return {
    title: "",
    content: "",
    isLocked: true,
  };
}

describe("Journal Editor Refresh & Lock TDD Tests", () => {
  it("should save entry, refresh inputs to empty, and lock the saved journal", () => {
    let savedEntry: { title?: string; content: string } | null = null;
    const addEntryMock = (entry: { title?: string; content: string }) => {
      savedEntry = entry;
    };

    const stateAfterSave = handleSaveJournal("My Goal", "Today was productive.", addEntryMock);

    // Verify entry saved
    expect(savedEntry).toEqual({
      title: "My Goal",
      content: "Today was productive.",
    });

    // Verify inputs refreshed to empty
    expect(stateAfterSave.title).toBe("");
    expect(stateAfterSave.content).toBe("");

    // Verify saved journal is locked
    expect(stateAfterSave.isLocked).toBe(true);
  });
});
