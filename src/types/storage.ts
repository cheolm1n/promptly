import { PromptDataWithId } from "./prompt";
import { Model } from "./models";

export type StoredData = {
  prompts?: PromptDataWithId[] | Record<number, PromptDataWithId>;
  selectedModel?: Model;
  hasUsedBefore?: boolean;
};
