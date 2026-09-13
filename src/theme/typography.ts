export const fontFamilies = {
  regular: "Poppins",
  medium: "Poppins-Medium",
  semiBold: "Poppins-SemiBold",
  bold: "Poppins-Bold",
} as const;

export const typography = {
  h1: { fontSize: 32, lineHeight: 38, fontFamily: fontFamilies.bold },
  h2: { fontSize: 24, lineHeight: 31, fontFamily: fontFamilies.semiBold },
  h3: { fontSize: 20, lineHeight: 26, fontFamily: fontFamilies.semiBold },
  h4: { fontSize: 16, lineHeight: 22, fontFamily: fontFamilies.medium },
  bodyLarge: { fontSize: 16, lineHeight: 26, fontFamily: fontFamilies.regular },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fontFamilies.regular,
  },
  bodySmall: { fontSize: 13, lineHeight: 21, fontFamily: fontFamilies.regular },
  caption: { fontSize: 11, lineHeight: 15, fontFamily: fontFamilies.regular },
} as const;

export type Typography = typeof typography;
