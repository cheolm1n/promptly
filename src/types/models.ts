export type ChatGPTModel =
  | "gpt-4o"
  | "o1"
  | "o1-mini"
  | "gpt-4o-mini"
  | "gpt-4";
export type ClaudeModel = "Claude 3.5 Sonnet";
export type PerplexityModel = "Perplexity";
export type Model = ChatGPTModel | ClaudeModel | PerplexityModel;

export type ModelOption = { label: string; model: Model; command: () => void };
export type ModelSeparator = { separator: true };
