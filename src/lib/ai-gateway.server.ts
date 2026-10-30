import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

/** Streams a Responses call and returns the final text. */
export async function askModel(messages: ModelMessage[], system: string) {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    throw new AiError(500, "The assistant isn't set up yet. Add OPENAI_API_KEY to your local .env file.");
  }

  const provider = createOpenAI({ apiKey });
  let failure: unknown;
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system,
    messages,
    maxRetries: 0,
    onError: ({ error }) => {
      failure = error;
    },
  });

  let text = "";
  try {
    text = await result.text;
  } catch (e) {
    failure ??= e;
  }

  if (failure || !text) throw toAiError(failure);
  return text;
}

export class AiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function toAiError(error: unknown): AiError {
  const status = (error as { statusCode?: number })?.statusCode ?? 500;
  if (status === 429) return new AiError(429, "Lots of shoppers right now — please try again in a moment.");
  if (status === 402) return new AiError(402, "The shopping assistant is paused for now. Please browse the shop directly.");
  if (status === 403) return new AiError(403, "The shopping assistant isn't available right now.");
  return new AiError(status, "The assistant couldn't answer just now. Please try again.");
}
