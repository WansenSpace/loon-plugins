# Loon Plugins

个人维护的 iOS Loon 插件仓库（含去广告、图床修复等实用插件）。

## 插件列表

### TikTok 去挂件V3

- **功能**：屏蔽 TikTok 左上角积分/金币激励悬浮挂件（如日区 P 币ポイ活、福袋、`TouchPoint` / `LuckyCat`）：阻断字节海外 TTNet 纯 IP HTTPDNS（`34.102.215.99` / `35.213.190.132`）绕过与 QUIC，拦截实测下发挂件模板的 `gecko31-normal-alisg.tiktokv.com` 及全系 `Gecko / Teko` 动态组件热更新源、专属激励图床（`ug-incentive`）与 `ugattribution` / `libra` / `widget` / `campaign` / `inapp` 子域；不对 `*.tiktokv.com` 核心视频 API 开启全局 MitM，避免 App Store 正版触发 SSL Pinning 断网。
- **插件订阅链接（Raw）**：
  ```
  https://raw.githubusercontent.com/WansenSpace/loon-plugins/main/TikTok_Hide_Pendant.plugin
  ```

### 闲鱼去广告V3（深度精简版）

- **功能**：
  - **修复去广告失效**：拦截阿里 AMDC 纯 IP 调度（`mobileDispatch`）与 QUIC，强制闲鱼 MTOP 请求回落标准 HTTPS（同时覆盖 `acs` / `g-acs` / `h5api` 多网关）。
  - **全场景去广告**：清空开屏广告池与预取缓存（防止本地缓存复发），移除首页信息流广告、搜索框填充词、搜索结果广告、关注/同城/圈子推广、悬浮弹窗并禁用首页摇一摇（保留底部「卖闲置」按钮）。
  - **界面深度精简与瞬时遮蔽**：采用阿里 CDN 长效缓存纯透明 PNG + Loon 请求阶段毫秒级缓存回放，极速遮蔽首页右上角「签到」原生图标并移除顶栏「补贴中」动图；「我的」页面仅保留个人信息/会员/收藏栏与「我的交易」，彻底移除「闲鱼回收」、中部工具栏、活动磁贴区（闲鱼币/神奇鱼塘/闲鱼游戏/签到）及底部「猜你喜欢」推荐商品流。
- **插件订阅链接（Raw）**：
  ```
  https://raw.githubusercontent.com/WansenSpace/loon-plugins/main/Xianyu_AdBlock.plugin
  ```

### 腾讯动漫去广告（增强版）

- **功能**：拦截腾讯动漫 iOS 开屏接口、腾讯广点通（优量汇）及国内主流聚合广告 SDK（穿山甲、快手、百度、Sigmob、TopOn、京东、阿里），并屏蔽 QUIC 防止绕过 MitM。
- **插件订阅链接（Raw）**：
  ```
  https://raw.githubusercontent.com/WansenSpace/loon-plugins/main/TencentComic_AdBlock.plugin
  ```

### cnBeta 图片修复V2（Folo）

- **作用**：解决在 Folo 中 RSS 订阅 cnBeta 新闻时，文章图片经常无法显示（裂图）或加载较慢的问题。
- **原理**：仅对目标主机为 cnBeta 图床的 Folo 图片代理请求解码并 301 长效缓存转直链（排除 `icons.folo.is` 等无关请求），使用 Loon 原生 `[Rewrite]` 修复防盗链（零 JS 开销），屏蔽 QUIC 防止绕过 MitM，图床默认跟随 Loon 代理分流以避免直连香港机房限速。
- **插件订阅链接（Raw）**：
  ```
  https://raw.githubusercontent.com/WansenSpace/loon-plugins/main/cnBeta_Folo_Image_Fix.plugin
  ```

## 使用方法

1. 打开 iOS 上的 **Loon** → 底部 **配置** → **插件** → 右上角 `+`。
2. 粘贴上面的插件订阅链接并安装。
3. 确保 Loon 首页已开启 **分流**、**复写（Rewrite）** 和 **MitM**（且 CA 证书已在 iOS 设置中完全信任）。
4. 将对应 App 从后台划掉后重启 1~2 次即可生效。
