"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function ItemTradeInput() {
  const id = useId();
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [errors, setErrors] = useState({ quantity: false, price: false });
  const [shakeAttempts, setShakeAttempts] = useState({ quantity: 0, price: 0 });

  function handleTrade() {
    setErrors({ quantity: quantity === "", price: price === "" });
    // Restart the animation only for fields that fail this attempt.
    setShakeAttempts((previous) => ({
      quantity: previous.quantity + (quantity === "" ? 1 : 0),
      price: previous.price + (price === "" ? 1 : 0),
    }));
  }

  return (
    <div role="group" aria-label="Item trade controls" className="mt-6 flex w-full flex-col items-start gap-4 text-left">
      <div className="grid w-full grid-cols-2 gap-3">
        <div className="space-y-2">
          <label htmlFor={`${id}-price`} className={`text-sm font-bold ${errors.price ? "text-red-400" : ""}`}>Price</label>
          <Input
            key={shakeAttempts.price}
            className={errors.price ? "motion-safe:animate-input-shake" : ""}
            id={`${id}-price`}
            name="price"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={price}
            aria-required="true"
            aria-invalid={errors.price}
            onChange={(event) => {
              if (/^\d*$/.test(event.target.value)) {
                setPrice(event.target.value);
                if (event.target.value !== "") setErrors((previous) => ({ ...previous, price: false }));
              }
            }}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`${id}-quantity`} className={`text-sm font-bold ${errors.quantity ? "text-red-400" : ""}`}>Quantity</label>
          <Input
            key={shakeAttempts.quantity}
            className={errors.quantity ? "motion-safe:animate-input-shake" : ""}
            id={`${id}-quantity`}
            name="quantity"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={quantity}
            aria-required="true"
            aria-invalid={errors.quantity}
            onChange={(event) => {
              if (/^\d*$/.test(event.target.value)) {
                setQuantity(event.target.value);
                if (event.target.value !== "") setErrors((previous) => ({ ...previous, quantity: false }));
              }
            }}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 self-center">
        <ToggleGroup
          type="single"
          aria-label="Trade side"
          value={side}
          onValueChange={(value) => {
            if (value === "buy" || value === "sell") setSide(value);
          }}
        >
          <ToggleGroupItem value="buy">buy</ToggleGroupItem>
          <ToggleGroupItem value="sell">sell</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="self-center">
        <Button onClick={handleTrade}>Trade</Button>
        </div>
    </div>
  );
}
