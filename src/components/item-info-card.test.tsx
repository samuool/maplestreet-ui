import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ItemInfoCard from "./item-info-card";

describe("ItemInfoCard", () => {
  it("renders integer-only trade controls beneath the item details", () => {
    render(<ItemInfoCard
      item={{ name: "Potion", usual: 100, low_7d: 100, high_7d: 100 }}
      onBack={vi.fn()}
    />);
    const controls = screen.getByRole("group", { name: "Item trade controls" });
    const table = screen.getByRole("table", { name: "Item details" });
    expect(table.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(controls).getByRole("button", { name: "trade" })).toBeInTheDocument();

    for (const name of ["Quantity", "Price"]) {
      const input = within(controls).getByRole("textbox", { name });
      fireEvent.change(input, { target: { value: "123" } });
      expect(input).toHaveValue("123");
      for (const invalid of ["1.5", "-1", "1e3", "abc", "12 3"]) {
        fireEvent.change(input, { target: { value: invalid } });
        expect(input).toHaveValue("123");
      }
      fireEvent.change(input, { target: { value: "" } });
      expect(input).toHaveValue("");
    }

    const buy = within(controls).getByRole("radio", { name: "buy" });
    const sell = within(controls).getByRole("radio", { name: "sell" });
    expect(buy).toHaveAttribute("aria-checked", "true");
    fireEvent.click(sell);
    expect(sell).toHaveAttribute("aria-checked", "true");
    expect(buy).toHaveAttribute("aria-checked", "false");
    fireEvent.click(sell);
    expect(sell).toHaveAttribute("aria-checked", "true");
  });
});
