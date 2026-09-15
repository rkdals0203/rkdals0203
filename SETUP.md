# 프로필 운영 안내

대상 계정: [rkdals0203](https://github.com/rkdals0203). 프로필 저장소 이름도 rkdals0203입니다.

## 현재 상태

- README, 설정, 활동 카드, 실제 기여 달력의 잔디 뱀, 자동 갱신 워크플로를 준비했습니다.
- Spotify 사용자 ID는 아직 연결되지 않았습니다. assets/spotify-pending.svg는 미리보기용이며 실제 음악 정보가 아닙니다.
- GitHub 저장소 생성, 커밋·푸시, 고정 저장소 변경, 서버에서의 Actions 실행은 아직 하지 않았습니다.
- 로그아웃한 공개 기여 달력에서도 익명 비공개 활동이 포함된 합계가 보이는 것을 확인했습니다. 공개 범위 설정을 새로 바꿀 필요는 없습니다.
- 커밋과 푸시는 사용자의 명시적인 게시 요청 이후 진행합니다.

## 문구와 배지 수정

Node.js 20 이상에서 실행할 수 있습니다. GitHub Actions는 Node.js 24를 사용하며 별도 런타임 패키지 설치가 필요하지 않습니다.

1. profile.config.json의 소개, 타이핑 문장, 연락처, skills 또는 aiTools를 수정합니다.
2. 다음 명령으로 README를 갱신하고 확인합니다.

    npm run readme
    npm run check

README는 설정에서 생성됩니다. README만 직접 수정하면 설정 동기화 검사에서 실패합니다. 섹션 구조를 바꾸려면 scripts/render-readme.mjs를 수정합니다.

활동 카드와 Spotify는 같은 320×445 원본 규격을 사용하고, README에서 둘 다 폭 300px로 표시합니다. 높이를 강제로 늘리지 않고 같은 비율로 축소하므로 상단과 하단이 맞습니다. 배경 #161b22, 모서리 10px, 제목 위치, 안쪽 300×300 영역의 여백도 맞췄습니다. 활동 카드는 큰 기여 수와 두 개의 보조 지표로 구성합니다.

두 카드는 라이트·다크 모드에서 모두 짙은 배경을 유지합니다. Spotify의 고정된 어두운 디자인에 맞춘 의도적인 선택입니다. 활동 SVG 두 파일도 같은 디자인이며, 나머지 README·타이핑·잔디 뱀은 화면 테마를 따릅니다. 공통 배경과 모서리는 profile.config.json의 spotify.backgroundColor / borderRadius를 수정한 뒤 README와 활동 자산을 다시 생성하면 바뀝니다. 연결 대기 카드도 npm run readme로 함께 갱신됩니다.

GitHub가 허용하는 HTML 이미지 정렬과 자연스러운 줄바꿈을 사용해, 모바일에서는 두 카드가 세로로 배치됩니다. 실제 Spotify 연결 후에는 서비스가 제공하는 곡명과 앨범 커버가 해당 자리를 채웁니다.

## Spotify 연결

1. [spotify-github-profile 연결 화면](https://spotify-github-profile.kittinanx.com/api/login)에서 본인 계정으로 연결합니다.
2. 완료 화면에서 제공하는 공개 카드 URL을 복사합니다. 인증 코드가 들어 있는 callback URL은 사용하지 않습니다.
3. 공개 카드 URL 또는 연결된 Spotify 프로필 URL로 실행합니다.

    npm run spotify -- "https://spotify-github-profile.kittinanx.com/api/view?uid=YOUR_PUBLIC_USER_ID"
    npm run check
    npm run ready

위 명령은 공개 사용자 ID만 저장하며 인증 토큰을 저장하지 않습니다. Spotify 프로필 URL만 넣는 경우에도 먼저 연결 서비스의 동의를 완료해야 카드가 작동합니다.

재생 중에는 현재 곡, 중지 상태에서는 최근 10곡 중 한 곡이 나옵니다. GitHub 이미지 캐시로 변경 반영이 늦어질 수 있습니다. 서비스 장애 시 소개·기술·활동·뱀은 유지되지만 Spotify 이미지의 자동 대체는 보장하지 않습니다.

현재 연결 시도에서 Spotify의 승인 화면에 일반 오류가 나타났습니다. callback으로 돌아오기 전에 실패했으므로 이 README 코드에서 해결할 수 있는 오류는 아닙니다. 서비스의 정확한 거부 사유는 확인되지 않았습니다. 새 연결 화면에서 재시도하거나 서비스가 복구된 뒤 연결할 수 있도록 카드 설정을 분리해 두었습니다.

연결 해제는 [Spotify 앱 관리](https://www.spotify.com/account/apps/)에서 해당 앱의 액세스를 제거합니다. 비밀 키나 인증 코드를 README, 설정 파일, 채팅에 넣지 않습니다.

## 활동 요약과 잔디 뱀

활동 카드의 데이터는 GitHub GraphQL 기여 달력의 날짜별 횟수뿐입니다. 공개적으로 표시하는 익명 비공개 기여도 포함됩니다. 저장소 이름이나 커밋 메시지는 조회하지 않습니다.

- Contributions: 달력의 기여 횟수 합계. 커밋 개수가 아닙니다.
- Active days: 기여 횟수가 1 이상인 날짜 수.
- Longest streak: 조회 범위 안에서 활동이 연속된 최장 날짜 수.
- 기간은 GitHub 기본 최근 1년이며, 날짜를 다시 다른 시간대로 변환해 재집계하지 않습니다. 갱신일만 KST로 표시합니다.

로컬에서 로그인된 GitHub CLI로 활동 카드를 다시 생성할 수 있습니다.

    node scripts/generate-activity.mjs --gh --out assets

운영 워크플로는 기본 GITHUB_TOKEN을 사용합니다. 비공개 저장소를 읽는 PAT를 추가하지 않습니다. GitHub 프로필의 Contribution settings에서 Private contributions가 표시되도록 설정하고, 로그아웃 화면에서도 기여 합계가 같은지 확인합니다.

GitHub Actions는 매일 KST 00:17, 12:17에 두 테마의 카드와 뱀을 생성합니다. 모든 파일을 검증한 뒤 output 브랜치에 한 번에 반영합니다. 실패한 작업은 기존 이미지를 덮어쓰지 않으며, 다른 변경과 충돌하면 강제 푸시하지 않고 실패합니다.

정상 갱신 커밋의 작성자는 github-actions[bot]입니다. 생성 이력은 output 브랜치에만 쌓입니다.

## 최초 게시 순서

아래 단계는 사용자가 게시와 커밋·푸시를 명시적으로 요청한 다음 수행합니다.

1. Spotify 연결을 완료하고 npm run check와 npm run ready가 성공하는지 확인합니다.
2. 공개 저장소 rkdals0203/rkdals0203을 만들고 기본 브랜치를 main으로 설정합니다.
3. 먼저 루트 README를 제외한 생성 코드·설정·워크플로를 main에 게시합니다. 워크플로는 README가 아직 없는 초기 상태도 허용합니다.
4. Actions의 Update profile assets를 수동 실행하고 output 브랜치에 네 SVG와 activity.json이 생성됐는지 확인합니다.
5. npm run ready -- --remote로 생성 이미지와 Spotify 카드의 실제 응답을 확인합니다.
6. 준비한 README를 main에 게시합니다. 이 시점에 GitHub 프로필에 나타납니다.
7. 아래 네 저장소를 순서대로 고정합니다.

| 순서 | 저장소 | 링크 |
|---|---|---|
| 1 | im-one | https://github.com/rkdals0203/im-one |
| 2 | air-mockup | https://github.com/rkdals0203/air-mockup |
| 3 | blog | https://github.com/rkdals0203/blog |
| 4 | rn-template | https://github.com/rkdals0203/rn-template |

air-mockup의 기존 Vercel 주소는 확인 당시 DEPLOYMENT_NOT_FOUND를 반환해 사용하지 않습니다. 비공개 저장소 공개 전환이나 프로젝트 코드 수정은 포함하지 않습니다.

8. 로그아웃한 방문자 화면에서 README, 링크, 실제 Spotify 카드, 라이트·다크 전환과 375px 모바일 화면을 최종 확인합니다.

## 갱신 실패 복구

Actions에서 Update profile assets의 실패한 단계를 확인하고 문제가 해결된 뒤 Run workflow로 다시 실행합니다. 오류 원문에 인증 정보를 추가로 출력하지 않습니다.

- GitHub API 실패 또는 데이터 불일치: 기존 output 자산을 유지한 상태로 재실행합니다.
- Git push 충돌: 최신 output 기준으로 워크플로를 다시 실행합니다. 강제 푸시는 하지 않습니다.
- Spotify 승인 오류: 해당 서비스의 연결을 다시 시도합니다. 임의의 다른 계정으로 카드를 채우지 않습니다.
- 예약 작업 비활성화: GitHub는 공개 저장소에 60일 동안 활동이 없으면 예약 작업을 비활성화할 수 있습니다. Actions에서 워크플로를 활성화하고 수동 실행합니다.

## 참고 구현

- [Yeachan-Heo](https://github.com/Yeachan-Heo): 상단 인사말·타이핑·배지 구성 참고.
- [cowkite](https://github.com/cowkite): 간결한 소개·기술 배지 구성 참고.
- [trueberryless](https://github.com/trueberryless): Spotify 카드·잔디 뱀 참고.
- [readme-typing-svg](https://github.com/DenverCoder1/readme-typing-svg), [Shields](https://shields.io), [GitHub Profile Views Counter](https://github.com/antonkomarev/github-profile-views-counter).
- [spotify-github-profile](https://github.com/kittinan/spotify-github-profile), [Platane/snk](https://github.com/Platane/snk).

미리보기의 스타일에는 MIT 라이선스의 github-markdown-css를 사용합니다. 프로필 생성 코드에는 외부 런타임 의존성이 없습니다.
