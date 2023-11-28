export default function strip0x(hex: string): string {
  return hex.replace(/^0x/, "");
}
