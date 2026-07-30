import { createCheckoutReassurance } from "./checkout_reassurance.ts";

const note = await createCheckoutReassurance({
  itemName: "Canvas weekender",
  deliveryWindow: "Arrives Tue-Thu",
  returnWindow: "30-day returns",
});

console.log(note);
