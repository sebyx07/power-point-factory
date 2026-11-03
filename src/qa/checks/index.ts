import type { Scene } from "@/core/types";
import type { Theme } from "@/theme/types";
import type { Finding } from "../types";
import { content } from "./content";
import { contrastCheck } from "./contrast";
import { geometry } from "./geometry";
import { images } from "./images";
import { links } from "./links";
import { story } from "./story";
import { typography } from "./typography";

/** All static checks on the scene graph — fast, no rendering needed. */
export function staticChecks(scene: Scene, theme: Theme): Finding[] {
  return [...geometry(scene, theme), ...typography(scene), ...contrastCheck(scene), ...content(scene), ...images(scene), ...links(scene), ...story(scene)];
}
