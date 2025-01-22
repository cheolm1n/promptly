export type InitialPromptData = string; // 출시버전 prompt의 type alias
export type PromptData = {
  // 최신 버전 prompt 데이터 type
  title: string;
  text: string;
};
export type PromptDataWithId = PromptData & { id: string };
export type PromptDataSync = {
  // 저장용 prompt 데이터 type
  id: string;
  title: string;
  text: string;
};
export type PromptDataExport = {
  // export용 prompt 데이터 type
  title: string;
  text: string;
};
export type ImportedPromptData = InitialPromptData | PromptDataExport; // import된 prompt의 type
