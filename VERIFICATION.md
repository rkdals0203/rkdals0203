# 구현 및 검증 결과

검증일: 2026-09-14 (Asia/Seoul)

## 구현한 내용

- 설정 파일에서 생성되는 프로필 README: 인사말, 테마별 타이핑, 연락처, Skills, Claude·Codex, 활동 요약, Spotify 연결 자리, 기여 달력 뱀.
- 실제 GitHub 기여 데이터로 생성한 활동 카드와 잔디 뱀의 라이트·다크 SVG.
- 하루 두 번 갱신하는 SHA 고정 GitHub Actions와 전용 output 브랜치 게시 코드.
- 공개 Spotify 카드 URL을 적용하는 명령, 게시 전 준비 상태 검사, 운영 안내.

## 확인 결과

| 검사 | 결과 |
|---|---|
| 집계 단위 테스트 | 5개 통과: 활동 없음, 연속 활동과 공백, 연도 경계, API 누락·합계 불일치, 비공개 메타데이터 제외 |
| README 설정 동기화 | 통과 |
| JavaScript 문법 | 모든 실행 모듈 통과 |
| 워크플로 문법 | 공식 actionlint 1.7.12 검사 통과 |
| SVG | 두 테마의 활동 카드·뱀 및 연결 대기 이미지의 XML 파싱 통과 |
| 게시 dry run | 정상 자산 묶음 검증 통과. Git 커밋·푸시 없이 실행 |
| 실패 방어 | 손상된 자산 묶음은 게시 전에 거부됨 |
| 실행 환경 방어 | 로컬에서 게시 명령을 실행해도 Git 작업 이전에 거부됨 |
| 실제 GitHub 렌더링 | stateless Markdown API가 반환한 HTML로 미리보기 구성 |
| 1280px 데스크톱 | 활동·Spotify 모두 표시 폭 300px, 높이 약 417px. 같은 행에서 상단·하단 일치. 공통 어두운 배경·모서리·내부 여백 적용 |
| 375px 모바일 | 카드가 자연스럽게 다음 행으로 내려오며 가로 넘침 없음. 이름이 중간에서 끊기지 않도록 처리 |
| 공개 범위 | 로그아웃한 GitHub 기여 달력에서도 익명 비공개 활동 합계 표시 확인 |

로컬 활동 스냅샷은 2026-09-14 18:06 KST에 생성했으며, 1,802 contributions / 220 active days / 23 days longest streak입니다. 이후 로그아웃 조회에서 1,803회가 보여 그 사이 새 활동이 반영됐음을 확인했습니다. 서로 다른 조회 시각의 숫자를 강제로 맞추지 않았습니다.

## 남은 외부 단계

1. Spotify 계정 연결: 본인 계정의 동의 화면까지 진입했으나 accounts.spotify.com 승인 단계에서 일반 오류가 발생했습니다. callback 도착 이전의 실패이며 정확한 원인은 확인되지 않았습니다. 새 연결 화면을 열어 두었습니다. 현재 미리보기의 음악 카드는 연결 대기 표시이고 실제 청취 곡이 아닙니다.

## 실제 게시 확인

- 공개 프로필 저장소와 README 게시 완료: https://github.com/rkdals0203/rkdals0203
- GitHub Actions가 활동 카드와 잔디 뱀을 output 브랜치에 게시하는 실행 성공.
- 게시된 GitHub 프로필에서 README, 활동 카드, 연결 대기 음악 카드, 잔디 뱀 렌더링 확인.
- 고정 저장소 순서 확인: im-one, air-mockup, blog, rn-template.

Spotify 연결 전에는 npm run ready가 실패하도록 해 미완성 카드를 실수로 게시하지 않게 했습니다.

## 미리보기

형제 디렉터리 github-profile-preview의 index.html / dark.html을 열면 테마별 미리보기를 볼 수 있습니다. desktop-light.png, desktop-dark.png, mobile-light.png, mobile-dark.png도 포함했습니다.

미리보기는 GitHub에서 받은 HTML의 미게시 자산 주소를 로컬 파일로 바꾸고 테마를 명시적으로 선택해 보여줍니다. GitHub의 실제 프로필 주변 UI와 고정 저장소 영역을 복제한 화면은 아닙니다.
