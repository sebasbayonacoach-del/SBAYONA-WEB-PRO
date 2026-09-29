/**
 * Router genérico con Jev. La política vive en código, no en el modelo.
 */
import { buildContactQuestions, systemOne } from "./jevDecide.js";

export async function decideContact({ text, apiKey, fetchImpl } = {}) {
  const questions = buildContactQuestions();
  const res = await systemOne({ state: text, questions, apiKey, fetchImpl });
  const a = res.answers || {};

  const intent = a.intent;
  const urgent = a.is_urgent?.noul ?? 0;
  const unsafe = a.is_unsafe?.noul ?? 0;
  const conf = intent?.confidence ?? 0;

  if (!intent || !intent.choice) return { action: "route_to_human", reason: "bad_shape", raw: res };
  if (unsafe >= 0.7) return { action: "route_to_human", reason: "safety_gate", raw: res };
  if (conf < 0.5) return { action: "route_to_human", reason: "low_confidence", raw: res };
  if (intent.choice === "precios" && urgent >= 0.7)
    return { action: "escalate_sales_urgent", reason: "urgent_pricing", raw: res };
  if (intent.choice === "entrenamiento" && urgent >= 0.7)
    return { action: "escalate_coaching_urgent", reason: "urgent_coaching", raw: res };
  return { action: `route_${intent.choice}`, reason: "normal", raw: res };
}
