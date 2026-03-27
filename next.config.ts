import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * Windows 등에서 네이티브 파일 감시가 불안정할 때 HMR이 멈추는 경우가 있어
   * 개발 모드에서 폴링으로 변경을 감지하게 합니다. (재시작 없이 저장 반영)
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

export default nextConfig
