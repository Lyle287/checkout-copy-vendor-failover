import assert from "node:assert/strict";
import test from "node:test";
import { makeCheckoutMessages } from "../src/checkout_reassurance.ts";

test("builds a checkout prompt from the store policy already shown to the shopper", () => {
  const messages = makeCheckoutMessages({
    itemName: "Canvas weekender",
    deliveryWindow: "Arrives Tue-Thu",
    returnWindow: "30-day returns",
  });

  assert.equal(messages[1].content.includes("Canvas weekender"), true);
  assert.equal(messages[1].content.includes("30-day returns"), true);
});
