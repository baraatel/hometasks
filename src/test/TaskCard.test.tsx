import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TaskCard } from "@/components/TaskCard";
import { LangProvider } from "@/lib/i18n";
import type { Task } from "@/lib/tasks";

const sampleTask: Task = {
  id: "task-1",
  title: "Dishwashing & Kitchen",
  title_ar: "غسيل الصحون والمطبخ",
  emoji: "🍽️",
  recurrence_type: "daily",
  recurrence_days: [],
  once_date: null,
  scheduled_time: "09:00:00",
  sort_order: 1,
  created_at: "2026-10-27T00:00:00Z",
  base_lang: "en",
  title_i18n: {
    en: "Dishwashing & Kitchen",
    ar: "غسيل الصحون وتنظيف المطبخ",
    hi: "बर्तन और रसोई की सफाई",
  },
  description_i18n: {
    en: "Wipe stove and empty sink strainer",
    ar: "مسح الموقد وتفريغ مصفاة الحوض",
  },
};

describe("TaskCard component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders title, description, emoji, and triggers onToggle when clicked", () => {
    const onToggle = vi.fn();
    render(
      <LangProvider>
        <TaskCard task={sampleTask} done={false} onToggle={onToggle} />
      </LangProvider>,
    );

    expect(screen.getByText("Dishwashing & Kitchen")).toBeInTheDocument();
    expect(screen.getByText("Wipe stove and empty sink strainer")).toBeInTheDocument();
    expect(screen.getByText("🍽️")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Dishwashing & Kitchen"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("renders Arabic text and flips document direction to RTL when ar is saved", () => {
    localStorage.setItem("ht-lang", "ar");
    render(
      <LangProvider>
        <TaskCard task={sampleTask} done={false} onToggle={() => {}} />
      </LangProvider>,
    );

    expect(screen.getByText("غسيل الصحون وتنظيف المطبخ")).toBeInTheDocument();
    expect(screen.getByText("مسح الموقد وتفريغ مصفاة الحوض")).toBeInTheDocument();
    expect(document.documentElement.dir).toBe("rtl");
  });

  it("falls back to base_lang description when target language description is missing", () => {
    localStorage.setItem("ht-lang", "hi");
    render(
      <LangProvider>
        <TaskCard task={sampleTask} done={false} onToggle={() => {}} />
      </LangProvider>,
    );

    expect(screen.getByText("बर्तन और रसोई की सफाई")).toBeInTheDocument();
    expect(screen.getByText("Wipe stove and empty sink strainer")).toBeInTheDocument();
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("reads the chore aloud via Web Speech API without toggling completion", () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    class FakeUtterance {
      text: string;
      lang = "";
      constructor(text: string) {
        this.text = text;
      }
    }
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: { speak, cancel },
    });
    (globalThis as unknown as { SpeechSynthesisUtterance: typeof FakeUtterance }).SpeechSynthesisUtterance =
      FakeUtterance;

    const onToggle = vi.fn();
    render(
      <LangProvider>
        <TaskCard task={sampleTask} done={false} onToggle={onToggle} size="xl" />
      </LangProvider>,
    );

    const speakBtn = screen.getByRole("button", { name: /Read aloud/i });
    fireEvent.click(speakBtn);

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(speak).toHaveBeenCalledTimes(1);
    expect(onToggle).not.toHaveBeenCalled();
  });
});

