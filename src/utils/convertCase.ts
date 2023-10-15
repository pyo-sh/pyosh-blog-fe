export const kebabToCamel = (kebabWord: string): string => {
  return kebabWord
    .toLowerCase()
    .replace(/-[a-z]/g, (str) => str[1].toUpperCase());
};

export const camelToKebab = (camelWord: string): string => {
  return camelWord.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? "-" : "") + $.toLowerCase()
  );
};
