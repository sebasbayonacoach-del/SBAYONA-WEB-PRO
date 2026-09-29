/**
 * Test mínimo Jev. Sin red, sin clave real. Mock de fetch con forma válida.
 */
import { describe, expect, it, vi } from "vitest";
import { buildContactQuestions } from "./jevDecide.js";
import { decideContact } from "./contactRouter.js";

function mockFetch(response) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => response,
  });
}

const base = {
  model: "mock-jev-1.13.0",
  usage: { input_tokens: 0, output_tokens: 0 },
  answers: {
    intent: {
      type: "choice",
      choice: "precios",
      confidence: 0.85,
      probabilities: { entrenamiento: 0.05, nutricion: 0.05, precios: 0.85, otro: 0.05 },
    },
    is_urgent: { type: "noul", noul: 0.9 },
    is_unsafe: { type: "noul", noul: 0.01 },
    interest: {
      type: "score",
      score: 2.0,
      confidence: 0.9,
      legend: { 0: "browse", 1: "interested", 2: "ready" },
      probabilities: { 0: 0.0, 1: 0.1, 2: 0.9 },
    },
  },
};

describe("jev router (mock)", () => {
  it("rutea precio urgente a ventas", async () => {
    const out = await decideContact({ text: "precio", apiKey: "DUMMY_FOR_TEST", fetchImpl: mockFetch(base) });
    expect(out.action).toBe("escalate_sales_urgent");
  });

  it("safety gate manda a humano", async () => {
    const unsafe = structuredClone(base);
    unsafe.answers.is_unsafe.noul = 0.95;
    const out = await decideContact({ text: "x", apiKey: "DUMMY_FOR_TEST", fetchImpl: mockFetch(unsafe) });
    expect(out.action).toBe("route_to_human");
  });

  it("preguntas cubren intención, urgencia, seguridad e interés", () => {
    const q = buildContactQuestions();
    expect(Object.keys(q).sort()).toEqual(["intent", "interest", "is_unsafe", "is_urgent"].sort());
  });
});
