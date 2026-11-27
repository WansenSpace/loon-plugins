# Loon Plugins

个人维护的 iOS Loon 插件仓库（含去广告、图床修复等实用插件）。

## 插件列表

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
