import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const remoteImageHosts = require("./src/shared/config/remote-image-hosts.json");

// decode-named-character-reference 의 "browser" export 는 index.dom.js 로 해석되는데,
// 이 파일은 module 최상단에서 `document.createElement` 를 호출한다.
// Next.js 는 Web Worker 번들도 browser condition 으로 빌드하기 때문에
// markdown-preview.worker.ts 가 로드되는 순간 ReferenceError 가 터진다.
// remark-parse 체인을 통해 non-DOM 엔트리(index.js)를 찾아 alias 로 고정한다.
function resolveDecodeNamedCharacterReference() {
  const remarkParsePath = require.resolve("remark-parse");
  return createRequire(remarkParsePath).resolve(
    "decode-named-character-reference",
  );
}

export default {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5500",
      },
      ...remoteImageHosts.map((hostname) => ({
        protocol: "https",
        hostname,
      })),
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "decode-named-character-reference$":
        resolveDecodeNamedCharacterReference(),
    };
    return config;
  },
};
