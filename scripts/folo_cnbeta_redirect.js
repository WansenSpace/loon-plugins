/**
 * Folo 图片代理转直链（仅针对 cnBeta 全系图床）
 * 自动解码多层 URL 编码，剥离额外代理参数，返回 302 重定向到 cnBeta 原图地址
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
      status: 302,
      headers: {
        Location: targetUrl,
        "Cache-Control": "no-cache"
      }
    }
  });
} else {
  $done({});
}
