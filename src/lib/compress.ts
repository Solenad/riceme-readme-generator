import LZString from "lz-string";

export function lzStringEncode(text: string): string {
  return LZString.compressToEncodedURIComponent(text);
}
