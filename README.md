# Promptly
## 개요
Promptly는 사용자가 프롬프트 템플릿을 쉽게 관리하여 ChatGPT를 더 쉽게 사용 할 수 있도록 돕는 Chrome 확장 프로그램입니다. 

langchain의 PromptTemplate이 제공해주는 편의성을 프로그래밍이 아닌 일상적인 사용에서도 누리고 싶어 만들었습니다.   

프롬프트를 추가, 수정, 복제, 삭제하고, 다양한 변수를 활용하여 손쉽게 커스터마이즈된 프롬프트를 생성할 수 있습니다. 

생성된 프롬프트는 버튼 클릭 한 번으로 ChatGPT 페이지에 전달되거나 클립보드에 복사하여 다른 곳에서 활용할 수 있습니다.

## 개발 배경
AI 모델을 활용해 작업할 때 자주 사용되는 프롬프트를 관리하는 것이 중요한데, Promptly는 이러한 과정을 효율화하기 위해 개발되었습니다. 

특히 Chrome 확장 프로그램 형태로 제작되어 웹 브라우저 상에서 즉시 프롬프트를 생성하고 관리할 수 있는 기능을 제공하며, 매번 복사/붙여넣기 없이 ChatGPT와 연동하여 빠르게 프롬프트를 전달할 수 있습니다.

## 주요 기능
- 프롬프트 템플릿 관리 (CRUD)
  - 새로운 프롬프트 템플릿 추가
  - 저장된 프롬프트 수정, 복제, 삭제
- 저장된 프롬프트의 동기화 (동일 계정)
- 변수 입력 UI 자동 생성
  - 프롬프트 템플릿에 포함된 변수({variable})를 자동 감지하고, 사용자 입력을 받을 수 있는 UI를 동적으로 생성
- 프롬프트 결과 생성 및 클립보드 복사
  - 입력된 변수 값을 바탕으로 완성된 프롬프트를 생성하고 클립보드로 복사
- ChatGPT로 프롬프트 전달

## 기술 스택
- 크롬 확장 프로그램
- Frontend:
  - JavaScript, HTML, CSS
  - Vue.js (v3.x)
- UI 프레임워크:
  - PrimeVue (v3.12.1): Vue 기반 UI 컴포넌트
  - PrimeIcons (v6.0.1): 아이콘 라이브러리
- 상태 관리 및 스토리지:
  - chrome.storage.sync, localStorage (로컬 환경 지원)
- 빌드 도구:
  - Vite (v5.4.10): 빠른 빌드 및 HMR 지원
  - @vitejs/plugin-vue (v5.1.4): Vue 지원 플러그인
- 데이터베이스: Chrome Sync Storage (확장 프로그램 전용 스토리지)

## 추가 개선 사항
- [x] `gpt-4`외 다른 모델 선택 기능
- [x] openai 외 다른 서비스 지원
- [x] 저장된 프롬프트의 export, import 기능
- [x] 저장된 프롬프트의 순서 변경
- [ ] 첫 사용자를 위한 샘플 추가
- [ ] 영문화 or 다국어화 (+ 개인 설정 추가)
- [x] primevue 버전 최신화
- [ ] manage 페이지의 tab-content 영역의 가로 너비 확장
- [ ] main 페이지에서 드롭다운위로 마우스 이동시 전체 요소가 왼쪽으로 이동하는 문제
- [ ] ~~`Run on` ... 버튼에서 모델 이름 강조~~ -> 불가능
- [x] `Run on` -> `Chat with` 로 변경
- [ ] ~~신규 모델 - 구글 제미나이 추가~~ -> 불가능
- [x] 신규 모델 - 퍼플렉시티 추가
- [ ] chat 서비스의 UI에서 promptly 실행
- [x] 토스트 팝업 위치 조정 (가운데로)
- [x] storage.js를 composable로 교체
- [x] 라이트/다크 모드 지원 
- [x] 아이콘 교체

## 만든이
- 개발: [![GitHub Badge](https://img.shields.io/badge/-cheolm1n-181717?style=flat-square&logo=github&logoColor=white&link=https://github.com/cheolm1n)](https://github.com/cheolm1n) [![GitHub Badge](https://img.shields.io/badge/-jongwoo328-181717?style=flat-square&logo=github&logoColor=white&link=https://github.com/jongwoo328)](https://github.com/jongwoo328)
- 아이콘 디자인: [![Instagram Badge](https://img.shields.io/badge/-su.roo0v0-E4405F?style=flat-square&logo=Instagram&logoColor=white&link=https://www.instagram.com/su.roo0v0)](https://www.instagram.com/su.roo0v0)