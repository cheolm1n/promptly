import { ref } from "vue";
import useI18n from "./useChromeI18n";

export default function useChromeStorage() {
    const { getLocale } = useI18n();

    const prompts = ref([]);
    const loaded = ref(false);
    const isChromeStorageAvailable = ref(typeof chrome !== 'undefined' && chrome.storage !== undefined);

    function get(key) {
        return new Promise((resolve, reject) => {
            if (isChromeStorageAvailable.value) {
                chrome.storage.sync.get(key, (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result);
                    }
                });
            } else {
                try {
                    const data = {};
                    data[key] = JSON.parse(localStorage.getItem(key));
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            }
        });
    }

    function set(data) {
        return new Promise((resolve, reject) => {
            if (isChromeStorageAvailable.value) {
                chrome.storage.sync.set(data, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            } else {
                try {
                    for (const key in data) {
                        localStorage.setItem(key, JSON.stringify(data[key]));
                    }
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }
        });
    }

    async function loadPrompts() {
        if (loaded.value) return; // 이미 로드된 경우 실행하지 않음
        try {
            const initData = await get('hasUsedBefore');
            const data = await get('prompts');
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
                await set({prompts: defaultPrompts, hasUsedBefore: true});
            } else {
                if (Array.isArray(data.prompts)) {
                    prompts.value = data.prompts;
                } else {
                    prompts.value = data.prompts ? Object.values(data.prompts) : [];
                }
            }
            loaded.value = true; // 데이터 로딩 완료 표시
        } catch (error) {
            console.error('Failed to load prompts:', error);
        }
    }

    // 컴포넌트에서 호출할 수 있도록 초기화를 유지함
    loadPrompts().then();

    return {
        prompts,
        loaded,
        get,
        set,
        loadPrompts,
        isChromeStorageAvailable,
    };
}
