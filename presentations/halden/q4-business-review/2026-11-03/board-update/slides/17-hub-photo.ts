import { slide } from "@/slide";

export default slide({
  layout: "imageFull",
  image: {
    generate: {
      prompt:
        "Aerial drone photograph of a large flat-roofed logistics building under construction beside a highway in southern Sweden, late afternoon low sun, long shadows, pine forest edges, trucks at loading docks, realistic, muted natural colors, high detail, no text, no logos",
      aspect: "16:9",
      model: "nano-banana-pro-2K",
    },
  },
  imageAlt: "Illustrative aerial view of a comparable logistics site",
  title: "Gothenburg: 40 minutes from the port, on the E6 corridor",
  caption: "Illustrative comparable site · proposed plot 62,000 m², option until Dec 15 · drive time: Port of Gothenburg route planner",
  notes: "Illustrative image, not the actual plot. The port connection (40 min, Port of Gothenburg route planner) is what makes the economics work.",
});
