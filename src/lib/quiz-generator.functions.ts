import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  topic: z.string().min(1).max(200),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]).default("medium"),
  count: z.number().int().min(1).max(30).default(10),
  notes: z.string().max(2000).optional(),
});

export type QuizQuestion = {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

export const generateQuiz = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<{ questions: QuizQuestion[] }> => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");

    const prompt = `Generate exactly ${data.count} ${data.difficulty} multiple-choice quiz questions about: "${data.topic}".${
      data.notes ? `\n\nAdditional context from the learner:\n${data.notes}` : ""
    }

Return ONLY valid JSON (no markdown, no code fences) matching this shape:
{
  "questions": [
    {
      "question": "string",
      "options": ["string","string","string","string"],
      "correct_index": 0,
      "explanation": "short explanation of why the correct answer is right"
    }
  ]
}

Rules:
- Exactly 4 options per question.
- correct_index is 0-3.
- Vary the position of the correct answer.
- Questions must be clear, unambiguous, factually correct.
- No duplicates.`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it:free",
        messages: [
          {
            role: "system",
            content:
              "You are Cortex Quiz Maker, an expert educator that produces high-quality multiple-choice quizzes. You always return strict JSON only.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenRouter error ${res.status}: ${text.slice(0, 300)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = json.choices?.[0]?.message?.content ?? "";

    // Strip code fences if present
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: { questions?: unknown };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Try to extract first {...} block
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI returned invalid JSON");
      parsed = JSON.parse(match[0]);
    }

    const QSchema = z.object({
      questions: z
        .array(
          z.object({
            question: z.string(),
            options: z.array(z.string()).length(4),
            correct_index: z.number().int().min(0).max(3),
            explanation: z.string(),
          })
        )
        .min(1),
    });
    const validated = QSchema.parse(parsed);
    return validated;
  });
