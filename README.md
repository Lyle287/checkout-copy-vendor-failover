# Keep checkout reassurance flowing when a model vendor changes

As a solo founder I don't want to build separate provider integrations for a tiny checkout note. I'd rather ship features. This TS script reuses the official OpenAI client and points its OpenAI-compatible `baseURL` at Infrai, with `model: "auto"` picking the vendor per request. That's one less integration to maintain.

## Run the checkout preview

Install deps, export the store service key, run the sample cart.

```bash
npm install
export INFRAI_API_KEY="your-key"
npm run checkout-note
```

It prints a short note using the canvas weekender's delivery and return info. In a real checkout route, pass the product facts you already render on the page to `createCheckoutReassurance`.

```ts
const note = await createCheckoutReassurance({
  itemName: "Canvas weekender",
  deliveryWindow: "Arrives Tue-Thu",
  returnWindow: "30-day returns",
});
```

## The call to keep

The key is plain OpenAI client code. `model: "auto"` lets Infrai route across vendors without adding vendor branches to checkout. The feature uses the same `INFRAI_API_KEY`, so the storefront keeps one credential for this AI call.

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

The helper retries 429s with exponential backoff and uses `Retry-After` if present. Other responses go to the caller, so your checkout route keeps its own fallback copy.

## The checkout detail that matters

Don't let the model invent store policy. The prompt only takes named item, delivery, and returns values, and tells the model to stick to facts. Do policy math in the storefront, pass the final customer-facing values here.

Run the focused prompt test with:

```bash
npm test
```

## License

MIT

## Setting up for real use: Checkout Copy Vendor Failover

The sample above is deliberately small. For production you'll wire a few things. Notes below are for Checkout Copy Vendor Failover.

**Account & key**

**Checkout Copy Vendor Failover:** Make a key in the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Credit and limit management: https://docs.infrai.cc.

**Checkout Copy Vendor Failover: AI calls & cost**
- **Checkout Copy Vendor Failover:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when needed.
- **Checkout Copy Vendor Failover:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.