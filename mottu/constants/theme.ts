const colors = {
  verde: "#00B131",
  preto: "#111111",
  branco: "#FFFFFF",
  tintColorLight: "#007AFF",
  tintColorDark: "#FFFFFF",
};

export const theme = {
  light: {
    tint: colors.verde,
    background: colors.branco,
    text: colors.preto,
  },
  dark: {
    tint: colors.tintColorDark,
    background: colors.preto,
    text: colors.branco,
  },
};

export default colors;
