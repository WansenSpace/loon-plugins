/*
 * 闲鱼 (Goofish) 深度去广告与页面精简脚本 (Loon http-response)
 * 仓库：https://github.com/WansenSpace/loon-plugins
 * 作用：
 *   1. 清空开屏广告池与预取缓存（同步/异步/同城），保留 MTOP 成功信封防止读取本地旧缓存
 *   2. 移除首页右上角「签到」图标入口、顶栏「补贴中」动图标签及「回收」频道
 *   3. 过滤首页、同城、关注、圈子、新发及搜索结果中的信息流广告与运营卡片
 *   4. 清除搜索框填充词、搜索发现热词及悬浮广告（保留底部「卖闲置」发布球）
 *   5. 深度精简「我的」页面：仅保留顶部个人信息/会员/收藏栏与「我的交易」，
 *      彻底移除「闲鱼回收」、中部工具栏、活动磁贴区（闲鱼币/神奇鱼塘/闲鱼游戏/签到/赚钱）及底部「猜你喜欢」推荐流
 *   6. 精简商品详情底部推荐与订单详情页底部推荐流
 */

(function () {
  const url = (typeof $request !== "undefined" && $request && $request.url) ? String($request.url) : "";
  const rawBody = (typeof $response !== "undefined" && $response) ? $response.body : null;
  if (!rawBody || typeof rawBody !== "string") {
    return $done({});
  }

  let obj;
  try {
    obj = JSON.parse(rawBody);
  } catch (e) {
    return $done({});
  }
  if (!obj || typeof obj !== "object") {
    return $done({});
  }

  // 兼容 MTOP 偶发的字符串化 data
  const dataWasString = typeof obj.data === "string";
  if (dataWasString) {
    try {
      obj.data = JSON.parse(obj.data);
    } catch (e) {
      return $done({});
    }
  }
  if (!obj.data || typeof obj.data !== "object") {
    return $done({});
  }

  const d = obj.data;
  let customHeaders = null;

  function hasApi(name) {
    return url.includes(`/${name}/`) || url.includes(`/${name}?`) || url.endsWith(`/${name}`);
  }

  function finish() {
    if (dataWasString) {
      obj.data = JSON.stringify(obj.data);
    }
    const result = { body: JSON.stringify(obj) };
    if (customHeaders) {
      result.headers = customHeaders;
    }
    return $done(result);
  }

  try {
    // 1. 开屏广告（同步 + 异步预取 + 同城开屏）：清空素材池并写回空缓存
    if (
      hasApi("mtop.taobao.idlecommerce.splash.ads") ||
      hasApi("mtop.taobao.idlecommerce.splash.async.ads") ||
      hasApi("mtop.taobao.idle.local.splash")
    ) {
      d.adMap = {};
      d.cacheAdInfo = null;
      d.realTimeAd = null;
      if (Array.isArray(d.dspList)) d.dspList = [];
      if (Array.isArray(d.ads)) d.ads = [];
      if (Array.isArray(d.adList)) d.adList = [];
      if (Array.isArray(d.materials)) d.materials = [];
      if ($response && $response.headers) {
        customHeaders = Object.assign({}, $response.headers, { "Cache-Control": "no-store" });
      }
      return finish();
    }

    // 2. 首页欢迎弹窗 / 场景恢复弹层 / 右上角签到鱼币组件 / 同城角落浮标
    if (
      hasApi("mtop.taobao.idle.home.welcome") ||
      hasApi("mtop.idle.idleadv.scene.restore") ||
      hasApi("mtop.taobao.idlehome.idle.coin.nextfresh") ||
      hasApi("mtop.taobao.idle.local.near.by.corner.info")
    ) {
      obj.data = {};
      return finish();
    }

    // 3. 首页右上角签到入口及小组件挂载容器 (whale.modulet)
    if (hasApi("mtop.taobao.idle.home.whale.modulet")) {
      if (d.container && typeof d.container === "object") {
        d.container.sections = [];
      }
      if (Array.isArray(d.sections)) {
        d.sections = [];
      }
      return finish();
    }

    // 4. 首页顶栏标签与右上角挂件清理 (home.circle.list，同时兼容 fy26 顶层 headList 与旧版 next.headList)
    if (hasApi("mtop.taobao.idlehome.home.circle.list")) {
      const allowedHeadBiz = new Set(["main", "market", "IDLE_CIRCLE"]);
      const cleanHeadList = (list) =>
        list
          .filter((item) => item && allowedHeadBiz.has(item.bizCode))
          .map((item) => {
            if (item.showInfo && typeof item.showInfo === "object") {
              delete item.showInfo.rightTagImage;
              delete item.showInfo.titleImage;
              delete item.showInfo.atmosphereImageUrl;
            }
            return item;
          });

      const cleanCircleList = (list) =>
        list.map((item) => {
          if (item && typeof item === "object") {
            if (item.showType) item.showType = "text";
            if (item.showInfo && typeof item.showInfo === "object") {
              delete item.showInfo.titleImage;
              delete item.showInfo.atmosphereImageUrl;
            }
          }
          return item;
        });

      if (Array.isArray(d.headList)) {
        d.headList = cleanHeadList(d.headList);
      }
      if (d.next && Array.isArray(d.next.headList)) {
        d.next.headList = cleanHeadList(d.next.headList);
      }
      if (Array.isArray(d.circleList)) {
        d.circleList = cleanCircleList(d.circleList);
      }
      if (d.next && Array.isArray(d.next.circleList)) {
        d.next.circleList = cleanCircleList(d.next.circleList);
      }
      // 清除顶栏右侧可能下发的签到/鱼币/活动挂件字段
      for (const key of ["rightButton", "rightIcon", "signEntry", "coinEntry", "coinInfo", "signInfo", "pendant", "floatIcon"]) {
        if (key in d) delete d[key];
        if (d.next && key in d.next) delete d.next[key];
      }
      return finish();
    }

    // 5. 首页主信息流与顶部金刚区净化 (home.nextfresh)
    if (hasApi("mtop.taobao.idlehome.home.nextfresh")) {
      delete d.bannerReturnDO;
      if (d.widgetReturnDO && typeof d.widgetReturnDO === "object") {
        d.widgetReturnDO.homeDynamicIcon = "false";
      }
      if (Array.isArray(d.homeTopList)) {
        d.homeTopList = d.homeTopList
          .filter((item) => item && item.sectionType === "kingkongDo")
          .map((item) => {
            if ("homeDynamicIcon" in item) item.homeDynamicIcon = "false";
            return item;
          });
      }
      if (Array.isArray(d.sections)) {
        const badTemplates = new Set([
          "fish_home_advertise_card_d4",
          "fish_home_yunying_card_d3",
          "fish_home_feeds_pager_banner",
          "idlefish_seafood_market",
          "fish_home_chat_room",
          "idlefish_home_industry_mini_app_card"
        ]);
        d.sections = d.sections.filter((sec) => {
          if (!sec || typeof sec !== "object") return false;
          const tpl = sec.template && typeof sec.template.name === "string" ? sec.template.name : "";
          const bizType = sec.data && sec.data.bizType;
          const cardTypeVal = sec.data && sec.data.cardTypeValue;
          const clickCardType = sec.data && sec.data.clickParam && sec.data.clickParam.args && sec.data.clickParam.args.cardType;

          if (bizType === "AD" || bizType === "homepage" || cardTypeVal === "AdCard") return false;
          if (clickCardType === "mamaAD" || clickCardType === "homeMultiBanner" || clickCardType === "banner") return false;
          if (badTemplates.has(tpl) || tpl.includes("advertise") || tpl.includes("yunying") || tpl.includes("banner")) return false;

          if (
            cardTypeVal === "Item" ||
            bizType === "item" ||
            tpl === "idlefish_home_new_commodity_card" ||
            tpl.includes("fish_home_tags_item_card")
          ) {
            return true;
          }
          return false;
        });
      }
      return finish();
    }

    // 6. 首页金刚区刷新接口 (widget.refresh.get)
    if (hasApi("mtop.taobao.idlehome.widget.refresh.get")) {
      if (Array.isArray(d.homeTopList)) {
        d.homeTopList = d.homeTopList.filter((item) => item && item.sectionType === "kingkongDo");
      }
      return finish();
    }

    // 7. 首页悬浮广告与弹窗策略：仅保留底部「卖闲置」发布球
    if (hasApi("mtop.taobao.idle.user.strategy.list")) {
      if (Array.isArray(d.strategies)) {
        d.strategies = d.strategies.filter(
          (s) => s && (s.type === "BIZ_PUBLISH_BALL" || s.bizType === "publish")
        );
      }
      if (Array.isArray(d.popupStrategies)) d.popupStrategies = [];
      if (Array.isArray(d.floatStrategies)) d.floatStrategies = [];
      return finish();
    }

    // 8. 「我的」页面深度精简 (mtop.idle.user.page.my.adapter)
    // 仅保留顶部头像/昵称/闲鱼会员/收藏栏 + 「我的交易」；
    // 彻底移除「闲鱼回收」、中部工具栏、活动磁贴区（闲鱼币/神奇鱼塘/闲鱼游戏/签到/赚钱）及底部「猜你喜欢」
    if (hasApi("mtop.idle.user.page.my.adapter") || hasApi("mtop.taobao.idle.user.page.my.adapter")) {
      if (d.container && Array.isArray(d.container.sections)) {
        d.container.sections = d.container.sections
          .filter((sec) => {
            if (!sec || typeof sec !== "object") return false;
            const tpl = sec.template && typeof sec.template.name === "string" ? sec.template.name : "";
            const biz = typeof sec.sectionBizCode === "string" ? sec.sectionBizCode : "";

            if (/(appraise|recycle|tool|entry|slider|banner|community|wonderful|activity|game|coin|feeds|guess|market)/i.test(tpl)) {
              return false;
            }
            if (/(appraise|recycle|tool|entry|slider|banner|community|wonderful|activity|game|coin|feeds|guess|market)/i.test(biz)) {
              return false;
            }

            if (/^my_fy\d+_(header|user_info|trade)$/i.test(tpl)) {
              return true;
            }
            if (/^(head|header|user|user_info|trade)/i.test(biz)) {
              return true;
            }
            return false;
          })
          .map((sec) => {
            if (sec.item && typeof sec.item === "object") {
              delete sec.item.recycle;
              delete sec.item.appraise;
              delete sec.item.tool;
              delete sec.item.tools;
              delete sec.item.card;
              delete sec.item.coin;
            }
            return sec;
          });
      }

      // 彻底移除「我的」页面底部「猜你喜欢」容器与标题挂载点
      d.ability = [];
      delete d.feeds;
      delete d.recommend;
      delete d.bottomSections;
      return finish();
    }

    // 9. 「我的」页面底部「猜你喜欢」推荐流清空（保留 MTOP 信封避免报错重试）
    if (
      hasApi("mtop.taobao.idle.item.buy.feeds") ||
      hasApi("mtop.idle.user.page.my.feeds") ||
      hasApi("mtop.taobao.idle.user.page.my.feeds") ||
      hasApi("mtop.taobao.wireless.home.xianyu.my.awesome.get") ||
      hasApi("mtop.taobao.wireless.home.xianyu.awesome.get")
    ) {
      obj.data = { sections: [], cardList: [], itemList: [], nextPage: "false", hasMore: "false" };
      return finish();
    }

    // 10. 商品详情页底部推荐标签与列表、消息页推荐用户精简（延续可莉规则）
    if (hasApi("mtop.taobao.idle.item.recommend.tab")) {
      if (Array.isArray(d.tabList)) {
        d.tabList.forEach((t) => {
          if (t && typeof t === "object") t.tabName = "";
        });
      }
      return finish();
    }

    if (hasApi("mtop.taobao.idle.item.recommend.list")) {
      d.cardList = [];
      if ("hasMore" in d) {
        d.hasMore = typeof d.hasMore === "string" ? "false" : false;
      }
      return finish();
    }

    if (hasApi("mtop.taobao.idle.playboy.recommend")) {
      obj.data = { recommends: [], items: [], next: false };
      return finish();
    }

    // 11. 搜索框默认填充词 / 底纹词清空
    if (
      hasApi("mtop.taobao.idlemtopsearch.search.shade") ||
      hasApi("mtop.taobao.idlemtopsearch.detailpage.search.shade")
    ) {
      obj.data = {};
      return finish();
    }

    // 12. 搜索激活页热搜词与搜索发现推广清理
    if (
      hasApi("mtop.taobao.idlemtopsearch.item.search.activate") ||
      hasApi("mtop.taobao.idlemtopsearch.search.activate.tablist") ||
      hasApi("mtop.taobao.idlemtopsearch.search.discover")
    ) {
      if (Array.isArray(d.cardList)) d.cardList = [];
      if (Array.isArray(d.tabList)) d.tabList = [];
      if (Array.isArray(d.resultList)) d.resultList = [];
      return finish();
    }

    // 13. 搜索结果页信息流广告过滤（同时兼容 acs 与 g-acs 网关）
    if (hasApi("mtop.taobao.idlemtopsearch.search")) {
      if (Array.isArray(d.resultList)) {
        const badSearchTemplates = new Set([
          "idlefish_seafood_vote",
          "idlefish_search_card_category_select",
          "idlefish_search_spu_market_publish"
        ]);
        d.resultList = d.resultList.filter((el) => {
          if (!el || typeof el !== "object") return false;
          const tpl = el.data && el.data.template && el.data.template.name;
          if (tpl && badSearchTemplates.has(tpl)) return false;

          const ex = el.data && el.data.item && el.data.item.main && el.data.item.main.exContent;
          if (ex) {
            if (ex.isAliMaMaAD === true || ex.isAliMaMaAD === "true") return false;
            const dislikeBiz =
              ex.dislikeFeedback &&
              ex.dislikeFeedback.clickParam &&
              ex.dislikeFeedback.clickParam.args &&
              ex.dislikeFeedback.clickParam.args.bizType;
            if (dislikeBiz === "ad") return false;
          }
          return true;
        });
      }
      delete d.resultPrefixBar;
      if (Array.isArray(d.topList)) d.topList = [];
      return finish();
    }

    // 14. 关注流、社区、新发、魔方页与同城页面广告过滤
    if (hasApi("mtop.taobao.idle.fun.follow.feed.list")) {
      if (Array.isArray(d.sections)) {
        d.sections = d.sections.filter((s) => s && s.cardType === 2001);
      }
      return finish();
    }

    if (hasApi("mtop.taobao.idle.fun.follow.often.visit")) {
      if (Array.isArray(d.sections)) d.sections = [];
      return finish();
    }

    if (hasApi("mtop.taobao.idlehome.home.community")) {
      if (Array.isArray(d.feedsList)) {
        d.feedsList = d.feedsList.filter((item) => {
          const name = item && item.template && item.template.name;
          return name === "idlefish_home_new_commodity_card" || name === "idlefish_home_new_content_card";
        });
      }
      return finish();
    }

    if (hasApi("mtop.taobao.idlehome.home.newitem.page")) {
      if (Array.isArray(d.sections)) {
        d.sections = d.sections.filter((item) => {
          const ct = item && item.data && item.data.clickParam && item.data.clickParam.args && item.data.clickParam.args.cardType;
          return ct !== "banner" && ct !== "mamaAD";
        });
      }
      return finish();
    }

    if (hasApi("mtop.taobao.idlehome.magic.home.page.list")) {
      delete d.topList;
      return finish();
    }

    if (hasApi("mtop.taobao.idle.local.home")) {
      if (Array.isArray(d.sections)) {
        d.sections = d.sections.filter((item) => {
          if (!item) return false;
          if (item.data && item.data.bizType === "AD") return false;
          if (item.template && item.template.cardEnum === "ads") return false;
          return true;
        });
      }
      return finish();
    }

    if (hasApi("mtop.taobao.idle.local.flow.plat.section")) {
      if (d.data && Array.isArray(d.data.components)) {
        d.data.components = d.data.components.filter((c) => {
          if (!c) return false;
          if (c.key === "fish_home_activity_enter_cardV1") return false;
          const name = c.data && c.data.template && c.data.template.name;
          return typeof name === "string" ? name.includes("fish_city_kingkong") : true;
        });
      }
      return finish();
    }

    if (hasApi("mtop.taobao.idle.local.home.top")) {
      if (d.data && Array.isArray(d.data.components)) {
        d.data.components = d.data.components.filter((c) => c && c.key === "fish_home_second_stage_top_cardV3");
      }
      return finish();
    }

    // 15. 订单详情页底部推荐流移除（仅保留订单状态、收货地址与订单信息）
    if (hasApi("mtop.taobao.idle.trade.full.info")) {
      if (Array.isArray(d.components)) {
        const keepRenders = new Set(["orderStatusVO", "addressInfoVO", "orderInfoVO"]);
        d.components = d.components.filter((c) => c && keepRenders.has(c.render));
      }
      return finish();
    }
  } catch (err) {
    return $done({});
  }

  return $done({});
})();
