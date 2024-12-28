export function getStringBytes(str: string) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  return encoded.length;
}
