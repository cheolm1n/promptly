import { PromptData } from "./prompt";
import { Model } from "./models";

export type StoredData = {
  prompts?: Record<number, PromptData>;
  selectedModel?: Model;
  hasUsedBefore?: boolean;
};
