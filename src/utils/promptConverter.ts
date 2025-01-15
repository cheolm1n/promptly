import { nanoid } from "nanoid";
import {
  ImportedPromptData,
  InitialPromptData,
  PromptData,
  PromptDataExport,
  PromptDataSync,
  PromptDataWithId,
} from "../types/prompt";

function updateInitialVersion(
  promptData: InitialPromptData,
  idx: number,
): PromptData {
  // 초기 버전의 promptData를 최신 버전으로 변환
  return {
    title: `#${idx + 1}`,
    text: promptData,
  };
}

export function updatePrompt(
  promptData: InitialPromptData | PromptData,
  idx: number,
): PromptData {
  // 이전 버전의 프롬프트 데이터를 최신화
  if (typeof promptData === "string") {
    // 초기 버전인 경우
    return updateInitialVersion(promptData, idx);
  }
  return promptData;
}

export function addId(promptData: PromptData | PromptDataWithId) {
  if ("id" in promptData) {
    return promptData;
  }
  return {
    ...promptData,
    id: nanoid(),
  };
}

export function convertPromptToExport(
  promptData: PromptData,
): PromptDataExport {
  // 프롬프트를 export 용으로 변환
  return {
    title: promptData.title,
    text: promptData.text,
  };
}

export function convertPromptToStore(
  promptData: PromptData | PromptDataWithId,
): PromptDataSync {
  // 프롬프트를 저장용으로 변환
  if ("id" in promptData) {
    return promptData;
  }
  return {
    ...promptData,
    id: nanoid(),
  };
}

export function convertImportedPrompt(
  promptData: ImportedPromptData,
  idx: number,
) {
  // import 된 데이터를 사용할 수 있도록 변환
  if (typeof promptData === "object") {
    return promptData;
  }
  return updateInitialVersion(promptData, idx);
}
