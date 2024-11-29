export function getStringBytes(str) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  return encoded.length;
}
