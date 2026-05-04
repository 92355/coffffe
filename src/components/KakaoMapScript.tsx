'use client'

import Script from 'next/script'

interface Props {
  apiKey: string
}

export default function KakaoMapScript({ apiKey }: Props) {
  return (
    <Script
      src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`}
      strategy="afterInteractive"
      onLoad={() => {
        window.dispatchEvent(new Event('kakaoMapReady'))
      }}
    />
  )
}
