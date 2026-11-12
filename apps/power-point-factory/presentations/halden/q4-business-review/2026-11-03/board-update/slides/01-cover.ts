import { slide } from "@/slide";

export default slide({
  layout: "cover",
  eyebrow: "Board of Directors  ·  November 2026",
  title: "Q4 2026 Business Review",
  subtitle: "Margin recovered ahead of plan. We ask the board to approve the Nordic hub.",
  image: {
    generate: {
      prompt:
        "Editorial photograph, interior of a modern Scandinavian logistics warehouse at dawn, tall pallet racks receding, one worker in a dark jacket checking a tablet, cool natural light through high windows, muted teal and grey palette, 35mm lens, shallow depth of field, documentary style, no text",
      aspect: "3:4",
      model: "nano-banana-pro-2K",
    },
  },
  imageAlt: "Warehouse aisle at dawn",
  presenter: "Maya Lindqvist, CFO",
});
