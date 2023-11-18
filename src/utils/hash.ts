import { createHash } from "crypto";

export const generateHash = (content: string) => {
  return createHash("sha256").update(content).digest("hex");
};
