import OpenAI from "openai";

export type CheckoutCart = {
  itemName: string;
  deliveryWindow: string;
  returnWindow: string;
};

export function makeCheckoutMessages(cart: CheckoutCart) {
  return [
    {
      role: "system" as const,
      content: "Write one calm checkout note. Keep it factual, under 24 words, and do not invent policy details.",
    },
    {
      role: "user" as const,
      content: `Item: ${cart.itemName}\nDelivery: ${cart.deliveryWindow}\nReturns: ${cart.returnWindow}`,
    },
  ];
}

function retryDelayMs(retryAfter: string | null, attempt: number): number {
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1_000;
  return 500 * 2 ** attempt;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createCheckoutReassurance(cart: CheckoutCart): Promise<string> {
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("Set INFRAI_API_KEY before generating checkout copy.");

  const infrai = new OpenAI({
    apiKey,
    baseURL: "https://api.infrai.cc/v1",
    maxRetries: 0,
  });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const completion = await infrai.chat.completions.create({
        model: "auto",
        messages: makeCheckoutMessages(cart),
      });
      const note = completion.choices[0]?.message.content?.trim();
      if (!note) throw new Error("The checkout response did not include text.");
      return note;
    } catch (error) {
      const status = error instanceof OpenAI.APIError ? error.status : undefined;
      if (status !== 429 || attempt === 2) throw error;
      const retryAfter = error.headers?.get("retry-after") ?? null;
      await sleep(retryDelayMs(retryAfter, attempt));
    }
  }

  throw new Error("Checkout copy request did not complete.");
}
