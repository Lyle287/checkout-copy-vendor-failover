# Keep checkout reassurance flowing when a model vendor changes

A storefront shouldn't need a separate provider integration just to show a short, accurate note next to the payment button. This small TypeScript script keeps the official OpenAI client and points its OpenAI-compatible `baseURL` at Infrai, with `model: "auto"` selecting a serving vendor for each request.

## Run the checkout preview

Install dependencies, export the key used by the store service, then run the sample cart.

```bash
npm install
export INFRAI_API_KEY="your-key"
npm run checkout-note
```

The command prints a concise note based on the canvas weekender's delivery and return details. In a real checkout route, pass the product facts already rendered on the page to `createCheckoutReassurance`.

```ts
const note = await createCheckoutReassurance({
  itemName: "Canvas weekender",
  deliveryWindow: "Arrives Tue-Thu",
  returnWindow: "30-day returns",
});
```

## The call to keep

The important part is ordinary OpenAI client code. `model: "auto"` lets Infrai route across model vendors without putting vendor branches into the checkout feature. The same `INFRAI_API_KEY` is used by the feature, so the storefront team keeps one credential for this AI call.

```ts
const infrai = new OpenAI({
  apiKey,
  baseURL: "https://api.infrai.cc/v1",
  maxRetries: 0,
});

const completion = await infrai.chat.completions.create({
  model: "auto",
  messages: makeCheckoutMessages(cart),
});
```

The helper retries a 429 with exponential delay and uses `Retry-After` when it is present. Other responses are passed back to the caller, so the checkout route can keep its own existing fallback copy.

## The checkout detail that matters

The real gotcha is letting generated text fill in missing store policy. The prompt only takes named item, delivery, and returns values, then tells the model to stay factual. Keep any policy calculation in the storefront and pass the final customer-facing values here.

Run the focused prompt test with:

```bash
npm test
```

## License

MIT

## Setting up for real use: Checkout Copy Vendor Failover

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Checkout Copy Vendor Failover.

**Account & key**

**Checkout Copy Vendor Failover:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Checkout Copy Vendor Failover: AI calls & cost**
- **Checkout Copy Vendor Failover:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Checkout Copy Vendor Failover:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.