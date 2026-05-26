import { typography } from "../design-system";
import { useTheme } from "../lib/theme";

// Heading primitive — required `level` prop (1–6) maps to the DOM tag;
// independent `visual` prop maps to the typography size token. Decouples
// document outline ("what this is for screen readers") from visual styling
// ("what this looks like"), the way Stripe Press and Arc do it.
//
// In dev, missing `level` throws so the semantic side can't be silently
// skipped. Pass `visual` to override default size (e.g. an h2 that looks
// like a body label, or an h1 that looks like a display number).

const VISUAL_TO_SIZE = {
  display: typography.display,
  heading: typography.heading,
  title:   typography.title,
  body:    typography.body,
  caption: typography.caption,
  label:   typography.label,
};

const LEVEL_DEFAULT_VISUAL = {
  1: "display",
  2: "heading",
  3: "title",
  4: "body",
  5: "body",
  6: "body",
};

export default function Heading({
  level,
  visual,
  weight = "semibold",
  font,
  children,
  style,
  ...rest
}) {
  if ((level == null || level < 1 || level > 6) && import.meta.env.DEV) {
    throw new Error(
      `<Heading> requires a level prop between 1 and 6 (got ${level}). ` +
      `The DOM tag is independent from visual styling — pass visual="..." to override size.`
    );
  }

  const { theme } = useTheme();
  const Tag = `h${level || 2}`;
  const v = visual || LEVEL_DEFAULT_VISUAL[level] || "body";
  const fontSize = VISUAL_TO_SIZE[v] ?? typography.body;
  // visual="label" produces the uppercase/letter-spaced treatment that
  // existing section labels use across Settings + Onboarding — letting
  // `<Heading level={2} visual="label">` drop in for what used to be
  // `<Label>` while gaining real heading semantics.
  const isLabelVisual = v === "label";
  const letterSpacing =
    v === "display" ? typography.displayLetterSpacing :
    v === "heading" || v === "title" ? typography.headingLetterSpacing :
    isLabelVisual ? typography.labelSpacing :
    "normal";

  return (
    <Tag
      style={{
        fontFamily: font === "heading" ? typography.fontHeading : font === "body" ? typography.fontBody : (isLabelVisual ? typography.fontBody : typography.fontHeading),
        fontSize,
        fontWeight: typography[weight] ?? typography.semibold,
        color: isLabelVisual ? theme.text.secondary : theme.text.primary,
        letterSpacing,
        lineHeight: isLabelVisual ? 1 : 1.25,
        textTransform: isLabelVisual ? "uppercase" : "none",
        margin: 0,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
