# 🌶️ 마라 익스프레스 (Mara Express) - GitHub Pages 배포 가이드

이 저장소는 마라탕 커스텀 주문 및 실시간 배달 배송 추적 시뮬레이션을 위한 Single Page Application(SPA) 웹 앱입니다.

GitHub Pages를 통해 웹 사이트를 무료로 호스팅하고 배포하기 위한 환경이 이미 설정되어 있습니다.

---

## 🚀 GitHub Pages 배포 순서

자동 배포를 위해 GitHub Actions 워크플로우(`.github/workflows/deploy.yml`)가 준비되어 있습니다. 아래 단계를 따라 저장소를 업로드하면 자동으로 배포됩니다.

### 1. 로컬 Git 저장소 초기화 및 커밋
터미널을 열고 프로젝트 폴더 경로에서 아래 명령어를 실행합니다.
```bash
# git 초기화
git init

# 파일 스테이징 및 커밋
git add .
git commit -m "feat: 마라탕 주문 배달 SPA 개발 완료 및 배포 설정 추가"
```

### 2. GitHub 원격 저장소 연결 및 푸시
GitHub에 신규 저장소(Repository)를 생성한 후 원격 저장소를 연결하여 푸시합니다.
```bash
# 본인의 GitHub 아이디와 레포지토리 이름으로 수정하여 실행
git remote add origin https://github.com/사용자아이디/저장소이름.git

# 메인 브랜치명 변경 후 푸시
git branch -M main
git push -u origin main
```

### 3. GitHub Pages 설정 변경 (중요!)
푸시가 완료된 후, GitHub 웹 사이트에서 아래 설정을 지정해 주어야 합니다.
1. 본인의 GitHub 레포지토리로 접속합니다.
2. 상단 탭에서 **Settings** ➡ 좌측 메뉴에서 **Pages**를 클릭합니다.
3. **Build and deployment** 항목의 **Source** 설정을 기존 `Deploy from a branch`에서 **`GitHub Actions`**로 변경합니다.
4. 이제 소스 코드가 `main` 또는 `master` 브랜치에 푸시될 때마다 GitHub Actions가 자동으로 빌드 및 배포 작업을 수행합니다.
5. 배포가 완료되면 페이지 상단에 생성되는 `https://사용자아이디.github.io/저장소이름/` 링크를 통해 사이트에 접속할 수 있습니다.

---

## 🛠️ 기술 스택 및 구조
- **HTML5 / CSS3 / JavaScript (Vanilla)**: 외부 빌드 도구 없이 브라우저에서 즉시 실행 가능한 초경량 정적 파일 구성
- **CSS Flexbox & Absolute Positioning**: 기기 해상도에 맞춰 데스크톱에서는 폰 목업으로, 모바일에서는 풀 스크린으로 자동 반응형 렌더링
- **SVG Path Animation**: 배달 상태 트래킹 시 실제 오토바이 아이콘의 이동과 타임라인 게이지가 SVG 애니메이션으로 연동
