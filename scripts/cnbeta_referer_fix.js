/**
 * cnBeta 全系图床防盗链修复
 * 清理原有 Referer/Origin，补全 cnBeta 官方 Referer
 */

const headers = Object.assign({}, $request.headers || {});

for (const key of Object.keys(headers)) {
  const lower = key.toLowerCase();
  if (lower === "referer" || lower === "origin") {
    delete headers[key];
  }
}

headers["Referer"] = "https://www.cnbeta.com.tw/";

$done({ headers });
