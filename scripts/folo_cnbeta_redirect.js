/**
 * Folo 图片代理转直链（V1 优化版，仅针对 cnBeta 全系图床）
 * - 自动解码多层 URL 编码，剥离额外代理参数
 * - 返回 301 + 长效 Cache-Control，避免重复跳转耗时
 */

const url = $request.url || "";

function extractTargetUrl(rawUrl) {
  const match = rawUrl.match(/[?&]url=([^&]+)/i);
  if (!match || !match[1]) return null;

  let decoded = match[1];
  for (let i = 0; i < 5; i++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch (e) {
      break;
    }
  }

  decoded = decoded.trim();
  if (decoded.startsWith("//")) {
    decoded = "https:" + decoded;
  } else if (/^http:\/\//i.test(decoded)) {
    decoded = decoded.replace(/^http:\/\//i, "https://");
  }

  return decoded;
}

const targetUrl = extractTargetUrl(url);
const isCnBetaImage =
  targetUrl &&
  /^https?:\/\/[^\/]+\.(cnbetacdn|cnbeta)\.(com|com\.tw)\//i.test(targetUrl);

if (isCnBetaImage) {
  $done({
    response: {
      status: 301,
      headers: {
        Location: targetUrl,
        "Cache-Control": "public, max-age=604800, immutable"
      }
    }
  });
} else {
  $done({});
}
