import { PromptData } from "./prompt";
import { Model } from "./models";

export type StoredData = {
  prompts?: PromptData[];
  selectedModel?: Model;
  hasUsedBefore?: boolean;
};
