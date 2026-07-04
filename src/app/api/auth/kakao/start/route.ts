import { NextRequest, NextResponse } from 'next/server'
import {
  KAKAO_OAUTH_STATE_COOKIE,
  KAKAO_PENDING_SIGNUP_COOKIE,
  KAKAO_RETURN_TO_COOKIE,
  getKakaoRestApiKey,
  getKakaoRedirectUri,
} from '@/lib/user-auth-edge'
import { isNicknameAnimal } from '@/lib/nickname'

const KAKAO_AUTHORIZE_URL = 'https://kauth.kakao.com/oauth/authorize'
const KAKAO_JS_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js'
const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10

export function GET(request: NextRequest) {
  const state = generateState()
  const redirectUri = getRedirectUri(request)
  const authorizeUrl = new URL(KAKAO_AUTHORIZE_URL)

  authorizeUrl.searchParams.set('client_id', getKakaoRestApiKey())
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('state', state)

  const jsAppKey = process.env['NEXT_PUBLIC_KAKAO_MAP_API_KEY']
  const response = jsAppKey
    ? new NextResponse(createKakaoTalkLoginPage({
      authorizeUrl: authorizeUrl.toString(),
      jsAppKey,
      redirectUri,
      state,
    }), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
    : NextResponse.redirect(authorizeUrl)
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: request.nextUrl.protocol === 'https:',
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
    path: '/',
  }

  response.cookies.set(KAKAO_OAUTH_STATE_COOKIE, state, cookieOptions)

  const pendingNickname = request.nextUrl.searchParams.get('nickname')
  const pendingAnimal = request.nextUrl.searchParams.get('animal')
  if (pendingNickname && pendingAnimal && isNicknameAnimal(pendingAnimal)) {
    response.cookies.set(
      KAKAO_PENDING_SIGNUP_COOKIE,
      JSON.stringify({ nickname: pendingNickname, animal: pendingAnimal }),
      cookieOptions,
    )
  }

  const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get('returnTo'))
  if (returnTo) {
    response.cookies.set(KAKAO_RETURN_TO_COOKIE, returnTo, cookieOptions)
  }

  return response
}

function createKakaoTalkLoginPage({
  authorizeUrl,
  jsAppKey,
  redirectUri,
  state,
}: {
  authorizeUrl: string
  jsAppKey: string
  redirectUri: string
  state: string
}): string {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>카카오 로그인</title>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      align-items: center;
      background:
        radial-gradient(circle at 18% 14%, rgba(216, 234, 176, 0.6), transparent 28%),
        linear-gradient(180deg, #fcf9f6 0%, #f4eadf 100%);
      color: #271310;
      display: flex;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      justify-content: center;
      margin: 0;
      min-height: 100dvh;
      padding: 22px;
      text-align: center;
    }

    main {
      background: rgba(255, 255, 255, 0.76);
      border: 1px solid rgba(234, 220, 203, 0.9);
      border-radius: 28px;
      box-shadow: 0 22px 60px rgba(63, 38, 24, 0.14);
      max-width: 340px;
      overflow: hidden;
      padding: 28px 24px 24px;
      position: relative;
      width: 100%;
    }

    .brand {
      align-items: center;
      display: inline-flex;
      font-size: 18px;
      font-weight: 900;
      gap: 2px;
      letter-spacing: 0.12em;
      justify-content: center;
      margin: 0 auto 22px;
      width: 100%;
    }

    .brand span:nth-child(2) {
      color: #556341;
    }

    h1 {
      font-size: 28px;
      font-weight: 950;
      letter-spacing: 0;
      line-height: 1.18;
      margin: 0;
    }

    p {
      color: #6f5835;
      font-size: 14px;
      font-weight: 700;
      line-height: 1.55;
      margin: 14px auto 0;
      max-width: 260px;
    }

    a {
      background: #fee500;
      border-radius: 12px;
      color: #191600;
      display: inline-flex;
      font-size: 14px;
      font-weight: 950;
      justify-content: center;
      margin-top: 22px;
      padding: 13px 18px;
      text-decoration: none;
      width: 100%;
    }

    small {
      color: #9a7b60;
      display: block;
      font-size: 11px;
      font-weight: 700;
      line-height: 1.45;
      margin-top: 12px;
    }
  </style>
</head>
<body>
  <main>
    <div class="brand" aria-label="원두로">
      <span>원</span><span>두</span><span>로</span>
    </div>
    <h1>카카오톡으로<br />로그인 중입니다</h1>
    <p>카카오톡이 열리지 않으면 아래 버튼으로 계속 로그인해 주세요.</p>
    <a href="${escapeHtml(authorizeUrl)}">카카오계정으로 로그인</a>
    <small>로그인하면 지금 닉네임을 내 프로필로 고정할 수 있어요.</small>
  </main>
  <script src="${KAKAO_JS_SDK_URL}"></script>
  <script>
    const jsAppKey = ${JSON.stringify(jsAppKey)};
    const redirectUri = ${JSON.stringify(redirectUri)};
    const state = ${JSON.stringify(state)};

    function loginWithKakaoTalk() {
      if (!window.Kakao || !window.Kakao.Auth) return;
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(jsAppKey);
      }
      window.Kakao.Auth.authorize({
        redirectUri,
        state,
        throughTalk: true,
      });
    }

    if (window.Kakao) {
      loginWithKakaoTalk();
    } else {
      window.addEventListener('load', loginWithKakaoTalk, { once: true });
    }
  </script>
</body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function generateState(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)

  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function getRedirectUri(request: NextRequest): string {
  return getKakaoRedirectUri() ?? new URL('/api/auth/kakao/callback', request.nextUrl.origin).toString()
}

function sanitizeReturnTo(value: string | null): string | null {
  if (!value?.startsWith('/')) return null
  if (value.startsWith('//')) return null

  return value
}
