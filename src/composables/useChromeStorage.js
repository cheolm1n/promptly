import { ref } from "vue";
import useI18n from "./useChromeI18n";

export default function useChromeStorage() {
    const { getLocale } = useI18n();

    const prompts = ref([]);
    const loaded = ref(false);
    const isChromeStorageAvailable = ref(typeof chrome !== 'undefined' && chrome.storage !== undefined);

    function get(key, callback) {
        if (isChromeStorageAvailable.value) {
            chrome.storage.sync.get(key, callback);
        } else {
            const data = {}
            data[key] = JSON.parse(localStorage.getItem(key));
            if (callback) {
                callback(data);
            }
        }
    }

    function set(data, callback) {
        if (isChromeStorageAvailable.value) {
            chrome.storage.sync.set(data, callback);
        } else {
            for (const key in data) {
                localStorage.setItem(key, JSON.stringify(data[key]));
            }
            if (callback) {
                callback();
            }
        }
    }

    async function loadPrompts() {
        if (loaded.value) return; // 이미 로드된 경우 실행하지 않음
        return new Promise((resolve) => {
            get('hasUsedBefore', (initData) => {
                get('prompts', (data) => {
                    const isFirstUse = !initData.hasUsedBefore && (!data.prompts || data.prompts.length === 0);
                    if (isFirstUse) {
                        // 첫 사용이고 저장된 프롬프트가 없을 경우 기본 예제 추가
                        let defaultPrompts;
                        if (getLocale() === "ko" || getLocale() === "ko-KR") {
                            defaultPrompts = [
                                "(샘플) 다음 텍스트를 {언어}로 번역해주세요:\n{텍스트}",
                                "(샘플) {문제 상황}에서 {선택지1}, {선택지2} 중 하나를 선택하는 데 도움을 주세요. 각 선택의 장단점을 비교해주세요.",
                                "(샘플) {제품명}의 {타겟 시장}을 위한 효과적인 마케팅 전략을 작성해주세요.\n주요 목표는 {목표}입니다."
                            ];
                        } else {
                            defaultPrompts = [
                                "(Sample) Please translate the following text into {language}:\n{text}",
                                "(Sample) Please help choose between {option1} and {option2} in the context of {situation}. Compare the pros and cons of each option.",
                                "(Sample) Write an effective marketing strategy for {product} targeting the {target market}. The main goal is {goal}."
                            ];
                        }
                        prompts.value = defaultPrompts;
                        set({ prompts: defaultPrompts.map(prompt => prompt), hasUsedBefore: true }, () => {
                            loaded.value = true; // 데이터 로딩 완료 표시
                            resolve();
                        });
                    } else {
                        if (Array.isArray(data.prompts)) {
                            prompts.value = data.prompts;
                        } else {
                            prompts.value = data.prompts ? Object.values(data.prompts) : [];
                        }
                        loaded.value = true; // 데이터 로딩 완료 표시
                        resolve();
                    }
                });
            });
        });
    };

    // 컴포넌트에서 호출할 수 있도록 초기화를 유지함
    loadPrompts();

    return {
        prompts,
        loaded,
        get,
        set,
        loadPrompts,
        isChromeStorageAvailable,
    };
}
