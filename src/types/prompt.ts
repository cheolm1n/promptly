export type InitialPromptData = string;
export type PromptData = {
  title: string;
  text: string;
};
export type PromptDataWithId = PromptData & { id: string };
