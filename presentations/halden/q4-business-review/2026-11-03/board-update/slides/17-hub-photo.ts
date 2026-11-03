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
  imageAlt: "Aerial view of the proposed hub site",
  title: "Gothenburg: 40 minutes from the port, on the E6 corridor",
  caption: "Proposed site, 62,000 m², exclusive option until December 15",
  notes: "Rendering of the site with the planned building. The port connection is what makes the economics work.",
});
