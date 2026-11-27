# Loon Plugins

个人维护的 iOS Loon 插件仓库（含去广告、图床修复等实用插件）。

## 插件列表

### 腾讯动漫去广告（增强版）

- **功能**：拦截腾讯动漫 iOS 开屏接口、腾讯广点通（优量汇）及国内主流聚合广告 SDK（穿山甲、快手、百度、Sigmob、TopOn、京东、阿里），并屏蔽 QUIC 防止绕过 MitM。
- **插件订阅链接（Raw）**：
  ```
  https://raw.githubusercontent.com/WansenSpace/loon-plugins/main/TencentComic_AdBlock.plugin
  ```

### cnBeta 图片修复（Folo）

- **作用**：解决在 Folo 中 RSS 订阅 cnBeta 新闻时，文章图片经常无法显示（裂图）的问题。
- **原理**：自动解码 Folo 图片代理链接并重定向为原图直连，同时为 cnBeta 全系图床补全防盗链请求头并强制直连。
- **插件订阅链接（Raw）**：
  ```
  https://raw.githubusercontent.com/WansenSpace/loon-plugins/main/cnBeta_Folo_Image_Fix.plugin
  ```

## 使用方法

1. 打开 iOS 上的 **Loon** → 底部 **配置** → **插件** → 右上角 `+`。
2. 粘贴上面的插件订阅链接并安装。
3. 确保 Loon 首页已开启 **分流**、**复写（Rewrite）** 和 **MitM**（且 CA 证书已在 iOS 设置中完全信任）。
4. 将腾讯动漫从后台划掉后重启 1~2 次即可生效。
