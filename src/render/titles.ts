/**
 * Promote the scene's title text box to a real slide-title placeholder, so PowerPoint's outline,
 * navigation, accessibility checker and screen readers see "Margin is back to 14.2%…" instead of "Slide 3".
 * Formatting stays explicit on the runs, so the look does not change.
 */
const TITLE_NAMES = ["title", "!!title"];

export function markTitle(xml: string): string {
  for (const name of TITLE_NAMES) {
    const re = new RegExp(
      `(<p:cNvPr id="\\d+" name="${name.replace(/[!]/g, "\\!")}">(?:</p:cNvPr>)?)<p:cNvSpPr(?: txBox="1")?\\s*/?>(?:</p:cNvSpPr>)?<p:nvPr>\\s*</p:nvPr>`,
    );
    if (re.test(xml)) return xml.replace(re, `$1<p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="title"/></p:nvPr>`);
  }
  return xml;
}

export const hasTitle = (xml: string) => xml.includes('<p:ph type="title"/>');
