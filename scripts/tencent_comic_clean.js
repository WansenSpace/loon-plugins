/*
 * 腾讯动漫 iOS 请求模块净化脚本 (极限净化版 - Loon http-request)
 * 作用：从 /User/async 与 /Home/async 的明文 module_names 参数中剔除广告、宝箱、AI、小游戏与领奖推广模块
 */

let body = $request.body || "";

if (body && body.includes("module_names=")) {
  const blockedModules = new Set([
    "v_club_ad",
    "wx_mini_game",
    "treasure_box",
    "ai_chat",
    "ai_chat_detail",
    "recent_comic_reward_prize",
    "new_back_user_limit_free_card"
  ]);

  body = body.replace(/(^|&)module_names=([^&]*)/, (match, prefix, val) => {
    try {
      const decoded = decodeURIComponent(val);
      const filtered = decoded
        .split("|")
        .filter((item) => {
          const name = item.split(",")[0].trim();
          return name && !blockedModules.has(name);
        })
        .join("|");
      return `${prefix}module_names=${encodeURIComponent(filtered)}`;
    } catch (e) {
      return match;
    }
  });
}

$done({ body });
