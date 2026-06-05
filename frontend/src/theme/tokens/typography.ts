type FontSizeToken = [string, { lineHeight: string; fontWeight?: string }];

export const typographyTokens: {
  sizes: Record<string, FontSizeToken>;
  weights: Record<string, string>;
} = {
  sizes: {
    bodyXs: ["0.75rem", { lineHeight: "1rem" }],
    bodySm: ["0.875rem", { lineHeight: "1.25rem" }],
    bodyMd: ["1rem", { lineHeight: "1.5rem" }],
    bodyLg: ["1.125rem", { lineHeight: "1.75rem" }],
    titleSm: ["1.125rem", { lineHeight: "1.5rem", fontWeight: "600" }],
    titleMd: ["1.5rem", { lineHeight: "2rem", fontWeight: "700" }],
    titleLg: ["1.875rem", { lineHeight: "2.25rem", fontWeight: "800" }],
  },
  weights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
};
