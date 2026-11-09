<template>
  <section :class="{ 'english-copy': language === 'en' }" :lang="language === 'en' ? 'en' : 'zh-CN'" class="chapter chapter-5" :id="id" ref="sectionEl">
    <ChapterIntro
      :ch-no="language === 'en' ? 'V' : chapter.number"
      :title="translateText(chapter.title)"
      :desc="translateText(chapter.description)"
      :duration="7"
      @done="onIntroDone"
    />

    <div class="map-fullscreen ch5-redesign" :class="{ show: introDone }">
      <ChapterCornerIntro chapter-key="ch5" :visible="introDone" />

      <!-- =============== LEFT: Tea tree with 3 clickable zones =============== -->
      <div class="ch5-left">
        <div class="ch5-tree-scene single-tree">
          <svg viewBox="0 0 600 820" class="tree-svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              <!-- 扩散圆动画 -->
              <radialGradient id="rippleGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="rgba(255,255,255,0.85)" />
                <stop offset="60%" stop-color="rgba(255,255,255,0.28)" />
                <stop offset="100%" stop-color="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>

            <!-- ============ 区域1: 叶片（对应茶树右上叶片团） ============ -->
            <g class="click-zone zone-leaves"
               :class="{ active: activePhonePanel === 'leaves', hover: hoveredZone === 'leaves' }"
               @mouseenter="hoveredZone = 'leaves'"
               @mouseleave="hoveredZone = null"
               @click="activePhonePanel = 'leaves'"
            >
              <!-- 点击热区（覆盖右上叶片团） -->
              <circle cx="390" cy="220" r="108" fill="rgba(255,255,255,0.001)" stroke="none" style="cursor:pointer" />
              <!-- 扩散圆动效（圆心即热区中心） -->
              <circle class="ripple ripple-1" cx="390" cy="220" r="18" fill="url(#rippleGrad)" />
              <circle class="ripple ripple-2" cx="390" cy="220" r="18" fill="url(#rippleGrad)" />
              <circle class="ripple ripple-3" cx="390" cy="220" r="18" fill="url(#rippleGrad)" />
              <!-- 标注框（左上） -->
              <g class="zone-tag" transform="translate(24, 70)">
                <rect x="0" y="0" width="172" height="72" rx="12"
                      :fill="activePhonePanel === 'leaves' ? 'rgba(92,124,58,0.95)' : 'rgba(247,244,235,0.92)'" />
                <text x="14" y="24"
                      :fill="activePhonePanel === 'leaves' ? '#FFF8E8' : '#5C7C3A'"
                      :style="{ fontSize: language === 'en' ? '11.5px' : '12.5px' }" style="font-weight:500;letter-spacing:0.05em">{{ translateText("叶片 · 新生") }}</text>
                <text x="14" y="41"
                      :fill="activePhonePanel === 'leaves' ? '#EFE9DA' : '#5A6655'"
                      :style="{ fontSize: language === 'en' ? '8px' : '9px' }" style="font-weight:500;letter-spacing:0.02em">{{ translateText("茶叶内销量") }}</text>
                <text x="14" y="60"
                      :fill="activePhonePanel === 'leaves' ? '#FFF8E8' : '#4A4A40'"
                      :style="{ fontSize: language === 'en' ? '16px' : '17px' }" style="font-weight:900;font-family:var(--font-huiwen)">{{ treeMetric(fmt(leavesDomesticLatest.volume, 2),"万吨") }}</text>
              </g>
            </g>

            <!-- ============ 区域2: 枝条（对应主干中部） ============ -->
            <g class="click-zone zone-branches"
               :class="{ active: activePhonePanel === 'branches', hover: hoveredZone === 'branches' }"
               @mouseenter="hoveredZone = 'branches'"
               @mouseleave="hoveredZone = null"
               @click="activePhonePanel = 'branches'"
            >
              <circle cx="285" cy="520" r="108" fill="rgba(255,255,255,0.001)" stroke="none" style="cursor:pointer" />
              <circle class="ripple ripple-1" cx="285" cy="520" r="18" fill="url(#rippleGrad)" />
              <circle class="ripple ripple-2" cx="285" cy="520" r="18" fill="url(#rippleGrad)" />
              <circle class="ripple ripple-3" cx="285" cy="520" r="18" fill="url(#rippleGrad)" />
              <g class="zone-tag" transform="translate(24, 478)">
                <rect x="0" y="0" width="184" height="72" rx="12"
                      :fill="activePhonePanel === 'branches' ? 'rgba(107,68,35,0.95)' : 'rgba(247,244,235,0.92)'" />
                <text x="14" y="24"
                      :fill="activePhonePanel === 'branches' ? '#FFF8E8' : '#6B4423'"
                      :style="{ fontSize: language === 'en' ? '11.5px' : '12.5px' }" style="font-weight:500;letter-spacing:0.05em">{{ translateText("枝条 · 远拓") }}</text>
                <text x="14" y="41"
                      :fill="activePhonePanel === 'branches' ? '#EFE9DA' : '#5A6655'"
                      :style="{ fontSize: language === 'en' ? '8px' : '9px' }" style="font-weight:500;letter-spacing:0.02em">{{ translateText("茶叶出口额") }}</text>
                <text x="14" y="60"
                      :fill="activePhonePanel === 'branches' ? '#FFF8E8' : '#4A4A40'"
                      :style="{ fontSize: language === 'en' ? '16px' : '17px' }" style="font-weight:900;font-family:var(--font-huiwen)">{{ treeMetric(fmt(exportTotal / 1e8, 2),"亿元") }}</text>
              </g>
            </g>

            <!-- ============ 区域3: 根系（对应泥土层根部中心） ============ -->
            <g class="click-zone zone-roots"
               :class="{ active: activePhonePanel === 'roots', hover: hoveredZone === 'roots' }"
               @mouseenter="hoveredZone = 'roots'"
               @mouseleave="hoveredZone = null"
               @click="activePhonePanel = 'roots'"
            >
              <circle cx="295" cy="750" r="112" fill="rgba(255,255,255,0.001)" stroke="none" style="cursor:pointer" />
              <circle class="ripple ripple-1" cx="295" cy="750" r="18" fill="url(#rippleGrad)" />
              <circle class="ripple ripple-2" cx="295" cy="750" r="18" fill="url(#rippleGrad)" />
              <circle class="ripple ripple-3" cx="295" cy="750" r="18" fill="url(#rippleGrad)" />
              <g class="zone-tag" transform="translate(24, 732)">
                <rect x="0" y="0" width="200" height="72" rx="12"
                      :fill="activePhonePanel === 'roots' ? 'rgba(178,143,76,0.95)' : 'rgba(247,244,235,0.92)'" />
                <text x="14" y="24"
                      :fill="activePhonePanel === 'roots' ? '#FFF8E8' : '#B28F4C'"
                      :style="{ fontSize: language === 'en' ? '11.5px' : '12.5px' }" style="font-weight:500;letter-spacing:0.05em">{{ translateText("根系 · 深植") }}</text>
                <text x="14" y="41"
                      :fill="activePhonePanel === 'roots' ? '#EFE9DA' : '#5A6655'"
                      :style="{ fontSize: language === 'en' ? '8px' : '9px' }" style="font-weight:500;letter-spacing:0.02em">{{ translateText("全国茶园面积") }}</text>
                <text x="14" y="60"
                      :fill="activePhonePanel === 'roots' ? '#FFF8E8' : '#4A4A40'"
                      :style="{ fontSize: language === 'en' ? '16px' : '17px' }" style="font-weight:900;font-family:var(--font-huiwen)">{{ treeMetric(fmt(gardenArea, 2),"千公顷") }}</text>
              </g>
            </g>
          </svg>
        </div>
      </div>

      <!-- =============== RIGHT: Phone/Tablet screen waterfall =============== -->
      <div class="ch5-right">
        <div class="phone-frame" :class="'panel-' + activePhonePanel">
          <!-- 手机顶部状态栏 -->
          <div class="phone-notch">
            <div class="notch-speaker"></div>
            <div class="notch-cam"></div>
          </div>
          <div class="phone-statusbar">
            <span class="sb-time">9:41</span>
            <span class="sb-title">{{ translateText(activePhonePanel === 'roots' ? '根深植' : activePhonePanel === 'leaves' ? '叶新生' : '枝远拓') }}</span>
            <span class="sb-signal">●●●</span>
          </div>

          <!-- 手机小程序内容区（瀑布流）：外层裁切 + 内层滚动，避免滚动条超出手机屏幕范围 -->
          <div class="phone-screen-wrap">
            <div class="phone-screen" :key="activePhonePanel">

            <!-- ========== 根系：根深植（瀑布流） ========== -->
            <div v-if="activePhonePanel === 'roots'" class="waterfall-panel panel-roots">

              <!-- 1. 标题与导语 -->
              <div class="lv-hero">
                <div class="lv-hero-kicker">{{ translateText("根系·深植") }}</div>
                <div class="lv-hero-sub">{{ translateText("中国茶园资源、生产基础与区域格局") }}</div>
                <div class="lv-hero-intro">{{ translateText("从茶园面积到核心产区，再到重点省份的长期变化，看一片茶叶生长所依托的土地基础与区域分布。") }}</div>
              </div>

              <!-- 顶部小工具条 -->
              <div class="wf-controls wf-ctrl-inline">
                <div class="ch5-metric-toggle small">
                  <button
                    v-for="m in metricOptions"
                    :key="m.key"
                    :class="['toggle-btn', { active: metric === m.key }]"
                    :style="metric === m.key ? { background: m.color, borderColor: m.color, color: '#FFFFFF' } : { color: '#3A3A2E' }"
                    @click="setMetric(m.key)"
                  >{{ translateText(m.label) }}</button>
                </div>
                <div class="ch5-year-slider small" :style="{ '--ch5-slider-accent': metricColor, '--ch5-slider-fill': rootsYearFillPct }">
                  <input type="range" :min="allProvinceYears[0]" :max="allProvinceYears[allProvinceYears.length - 1]" step="1" v-model.number="rootsYear" class="slider-input" />
                  <span class="slider-value">{{ translateText(rootsYear) }}</span>
                </div>
              </div>

              <!-- 概览 2x2 -->
              <div class="wf-overview-grid">
                <div class="ch5-overview-card small-card">
                  <div class="ov-label">{{ translateText("茶园面积") }}</div>
                  <div class="ov-value"><span class="ch5-stat-num">{{ translateText(fmt(rootsOverview.gardenArea, 2)) }}</span><span class="ov-unit">{{ translateText("千公顷") }}</span></div>
                </div>
                <div class="ch5-overview-card small-card">
                  <div class="ov-label">{{ translateText("茶叶产量") }}</div>
                  <div class="ov-value"><span class="ch5-stat-num">{{ translateText(fmt(rootsOverview.totalOutput, 2)) }}</span><span class="ov-unit">{{ translateText("万吨") }}</span></div>
                </div>
                <div class="ch5-overview-card small-card">
                  <div class="ov-label">{{ translateText("产量同比") }}</div>
                  <div class="ov-value">
                    <span class="ch5-stat-num" :style="{ color: rootsOverview.yoy >= 0 ? '#5C7C3A' : '#A8453A' }">
                      {{ translateText(rootsOverview.yoy !== null ? (rootsOverview.yoy >= 0 ? '+' : '') + rootsOverview.yoy.toFixed(2) + '%' : '—') }}
                    </span>
                  </div>
                </div>
                <div class="ch5-overview-card small-card">
                  <div class="ov-label">{{ translateText("统计省份") }}</div>
                  <div class="ov-value"><span class="ch5-stat-num">{{ translateText(rootsOverview.provinceCount) }}</span><span class="ov-unit">{{ translateText("个") }}</span></div>
                </div>
              </div>

              <!-- 地图 -->
              <div class="ch5-card small-card wf-map-card">
                <div class="card-title-sm">{{ translateText([rootsYear,"年中国各省",metricLabel,"分布"].join('')) }}</div>
                <div class="chart-container chart-map">
                  <div v-if="!mapReady" class="ch5-map-loading">{{ translateText("加载中…") }}</div>
                  <EChart v-else :option="rootsMapOption" @ready="onRootsMapReady" @click="onMapClick" style="height:280px" />
                </div>
                <div v-if="metric === 'gardenArea'" class="lv-chart-note">{{ translateText("图示说明：圆盘大小表示各省茶园面积（千公顷），圆盘越大，茶园面积越大；颜色深浅表示茶园面积占该省行政区划面积的覆盖率（%），颜色越深，覆盖率越高。") }}</div>
                <div v-else class="lv-chart-note">{{ translateText("图示说明：圆盘大小表示各省茶叶产量（万吨），圆盘越大，茶叶产量越高；圆盘颜色表示较上一年的产量增长率，绿色越深表示增长越快，绿色越浅表示增长较慢、产量下降或暂无可比数据。") }}</div>
              </div>

              <!-- 省份详情 -->
              <div class="ch5-card small-card wf-prov-card">
                <div class="card-title-sm">{{ translateText([selectedProvince,metricLabel,"变化趋势"].join('')) }}</div>
                <div v-if="rootsProvinceDetail" class="province-detail-body small">
                  <div class="chart-container chart-province-trend small">
                    <EChart :option="rootsProvinceTrendOption" style="height:200px" />
                  </div>
                </div>
                <div v-else class="empty-hint small">{{ translateText("点击地图选择省份") }}</div>
              </div>

              <!-- TOP10 排名 -->
              <div class="ch5-card small-card wf-rank-card">
                <div class="card-title-sm">{{ translateText([rootsYear,"年中国",metricLabel,"前十"].join('')) }}</div>
                <div class="ch5-chart-unit">{{ translateText(["单位：",metricUnit].join('')) }}</div>
                <div class="chart-container chart-ranking small">
                  <EChart :option="rootsRankingOption" style="height:240px" />
                </div>
              </div>
            </div>

            <!-- ========== 叶片：叶新生（2010—2024 长期趋势与新表达） ========== -->
            <div v-if="activePhonePanel === 'leaves'" class="waterfall-panel panel-leaves">

              <!-- 1. 标题与导语 -->
              <div class="lv-hero">
                <div class="lv-hero-kicker">{{ translateText("叶片·新生") }}</div>
                <div class="lv-hero-sub">{{ translateText("2010—2024 中国茶消费长期变化与新表达") }}</div>
                <div class="lv-hero-intro">{{ translateText("十五年间，中国茶消费从规模扩张走向量稳、价变与场景分化。沿着总量、价值、渠道与产品形态，观察一片茶叶如何进入新的日常。") }}</div>
              </div>

              <!-- 2. 先看结论：3张分析卡 -->
              <div class="lv-conclusion-list">
                <div v-for="c in leavesConclusions" :key="c.id" class="lv-conclusion-card">
                  <div class="lv-cc-title">{{ translateText(c.title) }}</div>
                  <!-- 规模扩张卡 -->
                  <template v-if="c.id === 'scale'">
                    <div class="lv-cc-scale-row">
                      <div class="lv-cc-scale-val"><span class="lv-cc-num">{{ translateText(c.startVal.toFixed(2)) }}</span><span class="lv-cc-unit">{{ translateText(c.unit) }}</span></div>
                      <div class="lv-cc-arrow">→</div>
                      <div class="lv-cc-scale-val"><span class="lv-cc-num">{{ translateText(c.endVal.toFixed(2)) }}</span><span class="lv-cc-unit">{{ translateText(c.unit) }}</span></div>
                    </div>
                    <div class="lv-cc-badge">{{ translateText(["累计增长约 ",c.growthPct,"%"].join('')) }}</div>
                  </template>
                  <!-- 增速换挡卡 -->
                  <template v-else-if="c.id === 'shift'">
                    <div class="lv-cc-phase-list">
                      <div v-for="(p, i) in c.phases" :key="i" class="lv-cc-phase">
                        <span class="lv-cc-phase-period">{{ translateText(p.period) }}</span>
                        <span class="lv-cc-phase-cagr">{{ translateText(p.cagr) }}%</span>
                      </div>
                    </div>
                  </template>
                  <!-- 近两年量稳价变卡 -->
                  <template v-else-if="c.id === 'recent'">
                    <div class="lv-cc-metrics">
                      <div v-for="(m, i) in c.metrics" :key="i" class="lv-cc-metric">
                        <span class="lv-cc-metric-label">{{ translateText(m.label) }}</span>
                        <span class="lv-cc-metric-change" :class="{ neg: m.change.startsWith('-') }">{{ translateText(m.change) }}</span>
                      </div>
                    </div>
                  </template>
                  <div class="lv-cc-desc">{{ translateText(c.desc) }}</div>
                </div>
              </div>

              <!-- 3. 图1：内销总量趋势 -->
              <div class="lv-chart-block">
                <div class="lv-chart-title">{{ translateText("茶叶国内销量总量趋势图（2010—2024年）") }}</div>
                <div class="ch5-card small-card">
                  <div class="chart-container" style="height:260px">
                    <EChart :option="leavesVolumeTrendOption" />
                  </div>
                </div>
                <div class="lv-chart-note">{{ translateText("2010—2024年中国茶叶内销量长期增长，但增长速度逐步放缓。2022—2024年总量接近平台期，市场观察重点开始由单纯扩量转向产品、价格带与消费场景的结构变化。") }}</div>
              </div>

              <!-- 4. 内销趋势三阶段结论 -->
              <div class="lv-stages">
                <div class="lv-stages-title"><span>{{ translateText("国内销量增势趋缓，") }}<br>{{ translateText("竞争转向结构升级") }}</span></div>
                <div class="lv-stage-list">
                  <div v-for="(s, i) in leavesStages" :key="s.id" class="lv-stage-card" :style="{ '--stage-color': stageColors[i] }">
                    <div class="lv-stage-num">{{ translateText(i + 1) }}</div>
                    <div class="lv-stage-body">
                      <div class="lv-stage-period">{{ translateText(s.period) }}</div>
                      <div class="lv-stage-name">{{ translateText(s.name) }}</div>
                      <div class="lv-stage-metrics">
                        <span class="lv-stage-metric">{{ translateText(["期初 ",s.startVolume.toFixed(2)," → 期末 ",s.endVolume.toFixed(2)," 万吨"].join('')) }}</span>
                        <span class="lv-stage-cagr">{{ translateText(["年均复合增速 ",s.cagr,"%"].join('')) }}</span>
                      </div>
                      <div class="lv-stage-conclusion">{{ translateText(s.conclusion) }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 5. 图2：内销总额与均价趋势 -->
              <div class="lv-chart-block">
                <div class="lv-chart-title">{{ translateText("茶叶国内销量总额与均价趋势图（2013—2024年）") }}</div>
                <div class="ch5-card small-card">
                  <div class="chart-container" style="height:300px">
                    <EChart :option="leavesValuePriceOption" />
                  </div>
                </div>
                <div class="lv-chart-note lv-chart-note-approx">{{ translateText("注：2013—2015年金额为公开图表数字化约数，以“≈”或浅色柱标注。") }}</div>
                <div class="lv-chart-note">{{ translateText("内销量保持稳定，但内销总额和平均单价在2022年后回落，说明市场并非简单持续上扬，更适合进一步观察价格带、产品形态和消费场景的重新分配。") }}</div>
              </div>

              <!-- 6. 图3：线上交易规模 -->
              <div class="lv-chart-block">
                <div class="lv-chart-title">{{ translateText("中国茶叶线上交易规模变化图（2016—2024年）") }}</div>
                <div class="ch5-card small-card">
                  <div class="chart-container" style="height:260px">
                    <EChart :option="leavesOnlineOption" />
                  </div>
                </div>
                <!-- 注意：已删除"线上渠道总体保持扩张..."原文及对应空白占位 -->
              </div>

              <!-- 7. 一片茶叶的六种新表达（入口卡，点击打开详情弹层） -->
              <div class="lv-products">
                <div class="lv-products-title">{{ translateText("一片茶叶的六种新表达") }}</div>
                <div class="lv-product-grid">
                  <div
                    v-for="p in leavesProductsSorted"
                    :key="p.order"
                    class="lv-product-card"
                    :class="{ 'is-active': detailProduct === p.order }"
                    @click="openProductDetail(p.order)">
                    <div class="lv-prod-head">
                      <div class="lv-prod-ord">{{ translateText(p.order) }}</div>
                      <div class="lv-prod-type">{{ translateText(p.type) }}</div>
                    </div>
                    <div class="lv-prod-subtitle">{{ translateText(p.subtitle) }}</div>
                    <div class="lv-prod-repr">
                      <span v-for="(prod, i) in p.entryProducts" :key="i" class="lv-prod-chip">{{ translateText(prod) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 8. 总结与数据来源 -->
              <div class="lv-summary">
                <div class="lv-summary-quote">{{ translateText("从盖碗中的一片叶，到街头的一杯茶，再到食品、健康与日化产品，茶正在以新的方式进入当代生活。") }}</div>
                <div class="lv-source-note">{{ translateText(leavesDataSource) }}</div>
              </div>

              <!-- ==== 六表达详情卡：手机内弹层（不超出手机外壳）==== -->
              <transition name="lv-fade">
                <div v-if="detailProduct" class="lv-detail-modal" @click.self="closeProductDetail">
                  <div v-if="detailProductData" class="lv-detail-card">
                    <button class="lv-detail-close" @click="closeProductDetail" type="button" :aria-label="translateText(&quot;关闭&quot;)">×</button>

                    <!-- 六张统一 3:2 横构图以顶部通栏方式完整显示 -->
                    <div class="lv-detail-media">
                      <img
                        class="lv-detail-image"
                        :src="detailProductData.image"
                        :alt="translateText(detailProductData.imageAlt)"
                      />
                    </div>

                    <div class="lv-detail-heading">
                      <div class="lv-detail-ord">{{ translateText(detailProductData.order) }}</div>
                      <div class="lv-detail-title-group">
                        <div class="lv-detail-type">{{ translateText(detailProductData.type) }}</div>
                        <div class="lv-detail-subtitle">{{ translateText(detailProductData.subtitle) }}</div>
                      </div>
                    </div>

                    <div class="lv-detail-body">
                      <!-- 数据、年份和统计范围改写为连贯文字 -->
                      <section class="lv-detail-summary">
                        <div class="lv-detail-sec-label">{{ translateText("数据概览") }}</div>
                        <p>{{ translateText(detailProductData.summary) }}</p>
                      </section>

                      <!-- 代表产品 -->
                      <section class="lv-detail-products">
                        <div class="lv-detail-sec-label">{{ translateText("代表产品") }}</div>
                        <div class="lv-detail-product-chips">
                          <span v-for="(prod, i) in detailProductData.products" :key="i" class="lv-prod-chip">{{ translateText(prod) }}</span>
                        </div>
                      </section>

                      <!-- 解读 -->
                      <section class="lv-detail-explain">
                        <div class="lv-detail-sec-label">{{ translateText("解读") }}</div>
                        <div class="lv-detail-explain-text">{{ translateText(detailProductData.explain) }}</div>
                      </section>

                      <!-- 来源 -->
                      <div class="lv-detail-source">
                        <span class="lv-detail-source-label">{{ translateText("资料来源：") }}</span>
                        <a
                          class="lv-detail-source-name"
                          :href="detailProductData.sourceUrl"
                          target="_blank"
                          rel="noopener noreferrer"
                        >{{ translateText(detailProductData.source) }}</a>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>

            </div>

            <!-- ========== 枝条：枝远拓（瀑布流） ========== -->
            <div v-if="activePhonePanel === 'branches'" class="waterfall-panel panel-branches">

              <!-- 1. 标题与导语 -->
              <div class="lv-hero">
                <div class="lv-hero-kicker">{{ translateText("枝条·远拓") }}</div>
                <div class="lv-hero-sub">{{ translateText("中国茶叶出口、市场连接与全球流动") }}</div>
                <div class="lv-hero-intro">{{ translateText("枝条向外延展，连接产地与世界。从出口规模、目的地分布到省—市流动，看中国茶如何走向全球市场。") }}</div>
              </div>

              <div class="wf-controls wf-ctrl-inline">
                <div class="ch5-year-slider small" :style="{ '--ch5-slider-accent': '#6B4423', '--ch5-slider-fill': branchesYearFillPct }">
                  <input type="range" :min="branchesYears[0]" :max="branchesYears[branchesYears.length - 1]" step="1" v-model.number="branchesYear" class="slider-input" />
                  <span class="slider-value">{{ translateText(branchesYear) }}</span>
                </div>
              </div>

              <div class="wf-overview-grid">
                <div class="ch5-overview-card small-card">
                  <div class="ov-label">{{ translateText("出口总额") }}</div>
                  <div class="ov-value"><span class="ch5-stat-num">{{ translateText(fmt(branchesOverview.totalExport / 1e8, 2)) }}</span><span class="ov-unit">{{ translateText("亿") }}</span></div>
                </div>
                <div class="ch5-overview-card small-card">
                  <div class="ov-label">{{ translateText("首位目的地") }}</div>
                  <div class="ov-value"><span class="ch5-stat-num">{{ translateText(branchesOverview.topCountry || '—') }}</span></div>
                </div>
                <div class="ch5-overview-card small-card">
                  <div class="ov-label">{{ translateText("目的地总数") }}</div>
                  <div class="ov-value"><span class="ch5-stat-num">{{ translateText(branchesOverview.countryCount) }}</span><span class="ov-unit">{{ translateText("国") }}</span></div>
                </div>
                <div class="ch5-overview-card small-card">
                  <div class="ov-label">{{ translateText("出口省份数量") }}</div>
                  <div class="ov-value"><span class="ch5-stat-num">{{ translateText(branchesOverview.provinceCount) }}</span><span class="ov-unit">{{ translateText("省") }}</span></div>
                </div>
              </div>

              <!-- 桑基图 -->
              <div class="ch5-card small-card wf-sankey-card">
                <div class="card-title-sm">{{ translateText([branchesYear,"年中国茶叶出口省至目的地流向图"].join('')) }}</div>
                <div class="chart-container chart-sankey small">
                  <EChart :option="branchesSankeyOption" style="height:320px" />
                </div>
                <div class="lv-chart-note">{{ translateText("图示说明：左侧为出口省份，右侧为出口目的地；连线方向代表出口流向；连线越粗、节点越高，对应出口额（亿元）越大。") }}</div>
              </div>

              <!-- TOP 10 目的地 -->
              <div class="ch5-card small-card">
                <div class="card-title-sm">{{ translateText([branchesYear,"年中国茶叶十大出口目的地"].join('')) }}</div>
                <div class="ch5-chart-unit">{{ translateText("单位：亿元") }}</div>
                <div class="chart-container chart-country-rank small">
                  <EChart :option="branchesCountryRankOption" style="height:240px" />
                </div>
              </div>

              <!-- 出口趋势 -->
              <div class="ch5-card small-card">
                <div class="card-title-sm">{{ translateText(["中国茶叶出口总额趋势（",branchesYears[0],"—",branchesYears[branchesYears.length - 2] ?? branchesYears[branchesYears.length - 1],"年）"].join('')) }}</div>
                <div class="chart-container chart-branch-trend small">
                  <EChart :option="branchesTrendOption" style="height:240px" />
                </div>
              </div>
            </div>

          </div> <!-- /.phone-screen -->
          </div> <!-- /.phone-screen-wrap -->
          <!-- 手机底部 Home indicator -->
          <div class="phone-homebar"></div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { useLanguage } from '../utils/language.js'
const { language, t: translateText } = useLanguage()
function treeMetric(value, unit) {
  return translateText(value + unit).replace('CNY 100 million', 'CNY 100m').replace('1,000 hectares', '1,000 ha').replace('10,000 tonnes', '10,000 t')
}
import { ref, computed, onMounted } from 'vue'
import EChart from './EChart.vue'
import ChapterIntro from './ChapterIntro.vue'
import ChapterCornerIntro from './ChapterCornerIntro.vue'
import { CHAPTER_META } from '../data/chapterMeta.js'
import * as echarts from 'echarts'
import proj4 from 'proj4'
import { assetUrl } from '../utils/base.js'
import {
  nationalData,
  provinceData,
  teaTypeData,
  countryData,
  provinceExportData,
  sankeyData,
  TEA_COLORS,
  TEA_INFO,
  TEA_ORDER,
  fmt,
  latestFullYear,
  latestProvinceYear,
  getNational,
  getProvince,
  LATEST_EXPORT_YEAR,
  // 叶片·新生 局部数据（2010—2024 长期趋势）
  LEAVES_CONCLUSIONS,
  LEAVES_DOMESTIC_TREND,
  LEAVES_ONLINE_TREND,
  LEAVES_STAGES,
  LEAVES_PRODUCT_APPS,
  LEAVES_DATA_SOURCE,
} from '../config/ch5.js'

const props = defineProps({ id: { type: String, required: true } })

// 根系板块地图统一采用中国 Albers 等积投影。
// 参考坐标系参数：中央经线 105°E，标准纬线 25°N、47°N；未指定的纬度原点取 0°。
const CHINA_ALBERS_CRS = '+proj=aea +lat_0=0 +lon_0=105 +lat_1=25 +lat_2=47 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs'
const chinaAlbersTransformer = proj4('EPSG:4326', CHINA_ALBERS_CRS)
const CHINA_ALBERS_PROJECTION = {
  project(point) {
    const projected = chinaAlbersTransformer.forward(point)
    // ECharts 画布纵轴向下，因此反转投影坐标的 Y 轴。
    return [projected[0], -projected[1]]
  },
  unproject(point) {
    return chinaAlbersTransformer.inverse([point[0], -point[1]])
  },
}
const ROOTS_CHINA_MAP_NAME = 'china-roots-albers'
const SOUTH_CHINA_SEA_MAP_NAME = 'china-south-sea-inset'
const SOUTH_CHINA_SEA_FRAME_NAME = '南海诸岛示意框'

// ---- 数据辅助：判断值是否为 "空/0/不存在"，为 true 则从可视化中剔除（折线转 null、饼/排名/Sankey过滤）
function isMissingVal(v) {
  if (v === null || v === undefined || v === '') return true
  if (typeof v === 'number') {
    return Number.isNaN(v) || v === 0
  }
  // 字符串：形如 "—" / "-" / "--" / 0 字符串等 → 空
  if (typeof v === 'string') {
    const s = v.trim()
    if (!s) return true
    if (/^[—\-–~_·]*$/.test(s)) return true
    const num = Number(s)
    if (!Number.isNaN(num)) return num === 0
    return false
  }
  return false
}
// 折线/堆叠用：缺失返回 null（ECharts 自动断线不绘制），非缺失原样
function numOrNull(v) {
  return isMissingVal(v) ? null : (typeof v === 'number' ? v : Number(v))
}
function arrHasAnyValue(arr) {
  return arr.some(v => v !== null && v !== undefined)
}

// ---- Tab system (兼容原逻辑) ----
const tabs = [
  { key: 'home', label: '茶树全景', icon: '🌳' },
  { key: 'roots', label: '根系·生产', icon: '🌱' },
  { key: 'leaves', label: '叶片·茶种', icon: '🍃' },
  { key: 'branches', label: '枝条·出口', icon: '🌐' },
]
// 手机屏幕当前显示的面板: roots/leaves/branches
const activePhonePanel = ref('roots')
// 保持 activeTab 为一个常量，用于原 roots/leaves/branches 选项内 v-show 始终显示（因为在手机里，不是整屏切换了）
const activeTab = computed({
  get() { return activePhonePanel.value },
  set(v) { if (['roots','leaves','branches'].includes(v)) activePhonePanel.value = v }
})

// ---- Shared refs ----
const sectionEl = ref(null)
const chapter = CHAPTER_META.ch5
const hoveredZone = ref(null)
const mapReady = ref(false)
const introDone = ref(false)
// 九段线（由 Albers 投影坐标逆向投影回经纬度），叠加在右下角南海插图上
const tendashLines = ref([])

// ---- 地图缩放联动：geo zoom 与 bubble symbolSize 同步 ----
const DEFAULT_GEO_ZOOM = 1.15
const currentGeoZoom = ref(DEFAULT_GEO_ZOOM)
let _rootsChartInstance = null

function onRootsMapReady(chart) {
  _rootsChartInstance = chart
  // 监听缩放/平移事件，同步 zoom
  chart.on('georoam', () => {
    try {
      const opt = chart.getOption()
      // 两个指标均复用同一个 Albers geo 与气泡图层。
      const z = opt.geo?.[0]?.zoom ?? DEFAULT_GEO_ZOOM
      if (typeof z === 'number' && z > 0) {
        currentGeoZoom.value = z
      }
    } catch (_) { /* ignore */ }
  })
}

// ---- Metric config ----
const metricOptions = [
  { key: 'gardenArea', label: '茶园面积', unit: '千公顷', color: '#B28F4C' },
  { key: 'totalOutput', label: '茶叶产量', unit: '万吨', color: '#5C7C3A' },
]
const metric = ref('gardenArea')
const metricLabel = computed(() => metricOptions.find(m => m.key === metric.value)?.label || '')
const metricUnit = computed(() => metricOptions.find(m => m.key === metric.value)?.unit || '')
const metricColor = computed(() => metricOptions.find(m => m.key === metric.value)?.color || '')

// ---- Roots state ----
const allProvinceYears = computed(() => {
  if (metric.value === 'totalOutput') return Array.from({ length: 13 }, (_, index) => 2012 + index)
  const years = new Set()
  // 只保留当前指标有非零数据的年份——茶园面积2024年全空则自动排除
  const m = metric.value
  provinceData.forEach(p => p.years.forEach(y => {
    if (y[m] > 0) years.add(y.year)
  }))
  return Array.from(years).sort((a, b) => a - b)
})
const rootsYear = ref(latestProvinceYear('gardenArea'))

// 滑块"已填充"百分比：用于自定义双段渐变 (已选段 = 主题色，未选段 = 白)
const rootsYearFillPct = computed(() => {
  const a = allProvinceYears.value
  if (!a || a.length < 2) return '0%'
  const lo = a[0]
  const hi = a[a.length - 1]
  const span = hi - lo
  if (!span) return '0%'
  return Math.max(0, Math.min(100, ((rootsYear.value - lo) / span) * 100)) + '%'
})

// 当前选中省份 + 当前指标的有效首尾年份范围（用于省份详情标题）
const provinceYearRange = computed(() => {
  const detail = rootsProvinceDetail.value
  if (!detail || !detail.years || detail.years.length < 2) return ''
  return `${detail.years[0]}—${detail.years[detail.years.length - 1]}年`
})

function setMetric(key) {
  metric.value = key
  const y = key === 'totalOutput' ? 2024 : latestProvinceYear(key)
  if (y) rootsYear.value = y
}

// ---- Leaves state (老茶种贸易数据变量保留，避免破坏模板其他引用) ----
const leavesYears = teaTypeData.map(d => d.year)
const leavesYear = ref(LATEST_EXPORT_YEAR)

// ---- 叶片·新生：交互状态（详情卡弹层）----
const detailProduct = ref(null) // order number or null
const detailProductData = computed(() => {
  if (!detailProduct.value) return null
  return LEAVES_PRODUCT_APPS.find(p => p.order === detailProduct.value) || null
})
function openProductDetail(order) {
  detailProduct.value = order
}
function closeProductDetail() {
  detailProduct.value = null
}

// 叶片·新生：数据引用
const leavesConclusions = computed(() => LEAVES_CONCLUSIONS)
const leavesStages = computed(() => LEAVES_STAGES)
const leavesProductsSorted = computed(() =>
  LEAVES_PRODUCT_APPS.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
)
const leavesDataSource = LEAVES_DATA_SOURCE

// 三阶段配色（由浅到深的茶绿色）
const stageColors = ['#C3D6AC', '#8BA667', '#516D33']

// ---- 图1：内销总量趋势（折线+面积，2010—2024全15年）----
const leavesVolumeTrendOption = computed(() => {
  const data = LEAVES_DOMESTIC_TREND
  const years = data.map(d => d.year)
  const volumes = data.map(d => d.volume)
  // 来源简称用于tooltip，不暴露"口径"字段
  const sourceShort = {}
  data.forEach(d => {
    const name = d.sourceUrl
    if (name && name.includes('news.cn')) sourceShort[d.year] = '新华社/行业公开'
    else if (name && name.includes('ctma')) sourceShort[d.year] = '中国茶叶流通协会'
    else if (name && name.includes('mofcom')) sourceShort[d.year] = '商务部'
    else if (name && name.includes('sciopen')) sourceShort[d.year] = '流通协会公开'
    else if (name && name.includes('cnwinenews')) sourceShort[d.year] = '行业公开资料'
    else if (name && name.includes('ipucha')) sourceShort[d.year] = '行业公开'
    else if (name && name.includes('chinadaily')) sourceShort[d.year] = 'China Daily公开'
    else if (name && name.includes('aticoc')) sourceShort[d.year] = '行业公开'
    else if (name && name.includes('hunan.gov')) sourceShort[d.year] = '政府公开数据'
    else sourceShort[d.year] = '公开行业资料'
  })
  return {
    textStyle: chartTextStyle,
    tooltip: {
      ...tooltipBase,
      trigger: 'axis',
      formatter: ps => {
        if (!ps || !ps.length) return ''
        const yr = ps[0].axisValue
        const item = data.find(x => String(x.year) === String(yr))
        if (!item) return `${yr}年`
        const s = sourceShort[item.year] || '公开资料'
        return `<b>${yr}年</b><br/>内销量：${fmt(item.volume, 2)} 万吨<br/><span style="font-size:10px;color:#8A8270">${s}</span>`
      },
      confine: true,
      extraCssText: 'max-width:240px; white-space:pre-wrap;',
    },
    grid: { containLabel: true, left: 38, right: 16, top: 26, bottom: 34 },
    xAxis: {
      type: 'category',
      data: years,
      axisLine: axisLineStyle,
      boundaryGap: false,
      axisLabel: {
        ...axisLabelStyle,
        interval: 2,
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      name: '万吨',
      nameGap: 10,
      nameLocation: 'end',
      nameTextStyle: { ...chartTextStyle, color: '#5C7C3A', fontSize: 10, align: 'right' },
      axisLine: { lineStyle: { color: '#5C7C3A' } },
      axisLabel: { ...axisLabelStyle, color: '#5C7C3A', fontSize: 10 },
      splitLine: splitLineStyle,
      max: 270,
    },
    series: [{
      name: '内销量',
      type: 'line',
      data: volumes,
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      showSymbol: true,
      lineStyle: { color: '#5C7C3A', width: 2.5 },
      itemStyle: { color: '#5C7C3A', borderWidth: 0 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(92,124,58,0.22)' },
          { offset: 1, color: 'rgba(92,124,58,0.04)' },
        ]),
      },
      markPoint: {
        symbol: 'circle',
        symbolSize: 54,
        data: [{ name: '2024峰值', value: '241.27', xAxis: 2024, yAxis: 241.27 }],
        itemStyle: { color: 'rgba(178,143,76,0.15)', borderColor: '#B28F4C', borderWidth: 1 },
        label: {
          ...chartTextStyle,
          formatter: '{c}',
          color: '#B28F4C',
          fontSize: 10,
          fontWeight: 700,
        },
      },
    }],
  }
})

// ---- 共享颜色变量（柱状图金色、折线茶绿色）供图例与系列统一引用，避免图例与实际图形颜色不一致 ----
const salesAmountColor = '#C8A155'
const salesAmountColorDark = '#B28F4C'
const avgPriceColor = '#5C7C3A'

// ---- 图2：内销总额（柱）+ 均价（线），2013—2024 双Y轴 ----
const leavesValuePriceOption = computed(() => {
  const data = LEAVES_DOMESTIC_TREND.filter(d => d.year >= 2013)
  const years = data.map(d => d.year)
  const doublePeakIndex = years.indexOf(2022)
  const doublePeakData = doublePeakIndex >= 0 ? data[doublePeakIndex] : null
  // 约数柱用透明度更低的金色，但仍保持金色主色
  const barData = data.map(d => ({
    value: d.value,
    _valueQualifier: d.valueQualifier || '精确',
    itemStyle: {
      color: d.valueQualifier === '约数'
        ? `rgba(178,143,76,0.55)`
        : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: salesAmountColor },
            { offset: 1, color: salesAmountColorDark },
          ]),
      borderRadius: [4, 4, 0, 0],
    },
  }))
  const lineData = data.map(d => d.avgPrice)
  return {
    textStyle: chartTextStyle,
    tooltip: {
      ...tooltipBase,
      trigger: 'axis',
      formatter: ps => {
        if (!ps || !ps.length) return ''
        const yr = ps[0].axisValue
        const item = data.find(x => String(x.year) === String(yr))
        if (!item) return `${yr}年`
        const valQual = item.valueQualifier === '约数' ? '（约）' : ''
        return `<b>${yr}年</b><br/>内销总额：${fmt(item.value, 2)} 亿元${valQual}<br/>平均单价：${fmt(item.avgPrice, 2)} 元/千克`
      },
      confine: true,
      extraCssText: 'max-width:240px; white-space:pre-wrap;',
    },
    legend: {
      top: 8,
      left: 'center',
      itemWidth: 12,
      itemHeight: 8,
      textStyle: { ...chartTextStyle, color: '#5A6655', fontSize: 14 },
      data: [
        { name: '内销总额（亿元）', itemStyle: { color: salesAmountColorDark, borderWidth: 0 } },
        { name: '平均单价（元/千克）', itemStyle: { color: avgPriceColor, borderWidth: 0 } },
      ],
    },
    // 为图例、双Y轴名称和高点标注预留独立空间，避免相互覆盖。
    grid: { containLabel: true, left: 42, right: 42, top: 74, bottom: 38 },
    color: [salesAmountColorDark, avgPriceColor],
    xAxis: {
      type: 'category',
      data: years,
      axisLine: axisLineStyle,
      axisLabel: { ...axisLabelStyle, fontSize: 10 },
    },
    yAxis: [
      {
        type: 'value',
        name: '亿元',
        nameGap: 12,
        nameLocation: 'end',
        nameTextStyle: { ...chartTextStyle, color: salesAmountColorDark, fontSize: 10, align: 'right' },
        axisLine: { lineStyle: { color: salesAmountColorDark } },
        axisLabel: { ...axisLabelStyle, color: salesAmountColorDark, fontSize: 10 },
        splitLine: splitLineStyle,
        // 2022年高点3395，max扩大到4000以容纳双高点标注
        max: 4000,
      },
      {
        type: 'value',
        name: '元/千克',
        nameGap: 12,
        nameLocation: 'end',
        nameTextStyle: { ...chartTextStyle, color: avgPriceColor, fontSize: 10, align: 'right' },
        axisLine: { lineStyle: { color: avgPriceColor } },
        axisLabel: { ...axisLabelStyle, color: avgPriceColor, fontSize: 10 },
        splitLine: { show: false },
        max: 170,
      },
    ],
    series: [
      {
        name: '内销总额（亿元）',
        type: 'bar',
        yAxisIndex: 0,
        data: barData,
        barWidth: '50%',
        itemStyle: { color: salesAmountColorDark }, // series默认色与图例一致
      },
      {
        name: '平均单价（元/千克）',
        type: 'line',
        yAxisIndex: 1,
        data: lineData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: avgPriceColor, width: 2.2 },
        itemStyle: { color: avgPriceColor, borderWidth: 0 },
        markPoint: {
          silent: true,
          symbol: 'triangle',
          symbolRotate: 180,
          symbolSize: 13,
          symbolOffset: [0, -7],
          itemStyle: { color: '#A8453A' },
          label: {
            ...chartTextStyle,
            show: true,
            formatter: '双高点',
            position: 'top',
            distance: 6,
            color: '#A8453A',
            fontSize: 11,
            fontWeight: 700,
          },
          data: doublePeakData ? [{ name: '平均单价高点', coord: [doublePeakIndex, doublePeakData.avgPrice] }] : [],
        },
      },
    ],
  }
})

// ---- 图3：线上交易规模（2021原始值缺失，展示层以相邻年份线性估计补足柱形）----
const leavesOnlineOption = computed(() => {
  const data = LEAVES_ONLINE_TREND
  const years = data.map(d => d.year)
  const estimateMissingValue = index => {
    let previous = null
    let next = null
    for (let i = index - 1; i >= 0; i -= 1) {
      if (data[i].value != null) { previous = data[i]; break }
    }
    for (let i = index + 1; i < data.length; i += 1) {
      if (data[i].value != null) { next = data[i]; break }
    }
    if (!previous || !next) return null
    const yearRatio = (data[index].year - previous.year) / (next.year - previous.year)
    return Number((previous.value + (next.value - previous.value) * yearRatio).toFixed(1))
  }
  return {
    textStyle: chartTextStyle,
    tooltip: {
      ...tooltipBase,
      trigger: 'axis',
      formatter: ps => {
        const p = ps?.[0]
        if (!p) return ''
        const item = data.find(x => String(x.year) === String(p.axisValue))
        if (!item) return `${p.axisValue}年`
        if (item.qualifier === '缺失') {
          return `<b>${p.axisValue}年</b><br/><span style="color:#A8453A">数据缺失</span>`
        }
        return `<b>${p.axisValue}年</b><br/>线上交易额：${item.displayValue}`
      },
      confine: true,
      extraCssText: 'max-width:220px; white-space:pre-wrap;',
    },
    grid: { containLabel: true, left: 38, right: 16, top: 26, bottom: 34 },
    legend: { show: false },
    xAxis: {
      type: 'category',
      data: years,
      axisLine: axisLineStyle,
      axisLabel: { ...axisLabelStyle, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      name: '亿元',
      nameGap: 10,
      nameLocation: 'end',
      nameTextStyle: { ...chartTextStyle, color: '#5A6655', fontSize: 10, align: 'right' },
      axisLine: axisLineStyle,
      axisLabel: { ...axisLabelStyle, fontSize: 10 },
      splitLine: splitLineStyle,
      // 420容柱顶标签不溢出
      max: 420,
    },
    series: [{
      type: 'bar',
      barWidth: '52%',
      data: data.map((d, index) => {
        if (d.value === null) {
          const estimatedValue = estimateMissingValue(index)
          return {
            value: estimatedValue,
            _displayValue: '',
            _estimatedValue: estimatedValue,
            itemStyle: {
              color: 'rgba(139,166,103,0.38)',
              borderColor: '#7F985D',
              borderWidth: 1.5,
              borderType: 'dashed',
              borderRadius: [4, 4, 0, 0],
            },
          }
        }
        // 所有有效柱体使用统一茶绿色
        return {
          value: d.value,
          _displayValue: d.displayValue,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#8BA667' },
              { offset: 1, color: '#5C7C3A' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        }
      }),
      label: {
        ...chartTextStyle,
        show: true,
        position: 'top',
        color: '#3A4D38',
        fontSize: 9,
        fontWeight: 600,
        formatter: p => p.data?._displayValue ?? '',
      },
    }],
  }
})

// ---- Branches state ----
const branchesYears = countryData.map(d => d.year).filter(y => y <= 2024).sort((a, b) => a - b)
const branchesYear = ref(LATEST_EXPORT_YEAR <= Math.max(...branchesYears) ? LATEST_EXPORT_YEAR : Math.max(...branchesYears))
const branchesYearFillPct = computed(() => {
  const a = branchesYears
  if (!a || a.length < 2) return '0%'
  const lo = a[0]
  const hi = a[a.length - 1]
  const span = hi - lo
  if (!span) return '0%'
  return Math.max(0, Math.min(100, ((branchesYear.value - lo) / span) * 100)) + '%'
})

// ---- Roots selected province ----
const selectedProvince = ref('云南省')

// ============================================================
//  Home view computeds
// ============================================================
const homeYear = latestFullYear()
const homeNat = getNational(homeYear)
const gardenArea = homeNat?.gardenArea ?? 0
const output = homeNat?.totalOutput ?? 0
const homeExportYearData = countryData.find(y => y.year === LATEST_EXPORT_YEAR)
const exportTotal = homeExportYearData
  ? homeExportYearData.countries.reduce((s, c) => s + c.value, 0)
  : 0

// 叶片茶树标注框使用：LEAVES_DOMESTIC_TREND最后一条有有效内销量的年份
const leavesDomesticLatest = (() => {
  const list = LEAVES_DOMESTIC_TREND.slice().reverse()
  const hit = list.find(d => d.volume != null && !Number.isNaN(Number(d.volume)))
  return hit || { year: null, volume: 0 }
})()

// ============================================================
//  中国各省面积常量表（单位：km²）
//  数据来源：中华人民共和国国家统计局《中国统计年鉴》公开行政区划面积数据
//  参考链接：https://www.stats.gov.cn/sj/tjnj/ （各省份土地面积/行政区划面积）
// ============================================================
const PROVINCE_AREAS = {
  '北京市': 16410,
  '天津市': 11966,
  '河北省': 188800,
  '山西省': 156700,
  '内蒙古自治区': 1183000,
  '辽宁省': 148000,
  '吉林省': 187400,
  '黑龙江省': 473000,
  '上海市': 6340,
  '江苏省': 107200,
  '浙江省': 105500,
  '安徽省': 140100,
  '福建省': 124000,
  '江西省': 166900,
  '山东省': 157900,
  '河南省': 167000,
  '湖北省': 185900,
  '湖南省': 211800,
  '广东省': 179800,
  '广西壮族自治区': 237600,
  '海南省': 35400,
  '重庆市': 82400,
  '四川省': 486000,
  '贵州省': 176200,
  '云南省': 394100,
  '西藏自治区': 1228400,
  '陕西省': 205600,
  '甘肃省': 425900,
  '青海省': 722300,
  '宁夏回族自治区': 66400,
  '新疆维吾尔自治区': 1664900,
  '台湾省': 36013,
  '香港特别行政区': 1114,
  '澳门特别行政区': 33,
}

// ============================================================
//  中国各省会/首府中心经纬度（用于气泡散点定位）
//  数据来源：公开地理坐标数据（WGS84 近似值，ECharts 坐标系适用）
// ============================================================
const PROVINCE_COORDS = {
  '北京市': [116.405285, 39.904989],
  '天津市': [117.200983, 39.084158],
  '河北省': [114.502461, 38.045474],
  '山西省': [112.549248, 37.857014],
  '内蒙古自治区': [111.75199, 40.841439],
  '辽宁省': [123.429096, 41.796767],
  '吉林省': [125.3245, 43.886841],
  '黑龙江省': [126.642464, 45.756967],
  '上海市': [121.472644, 31.231706],
  '江苏省': [118.767413, 32.041544],
  '浙江省': [120.153576, 30.287459],
  '安徽省': [117.283042, 31.86119],
  '福建省': [119.306239, 26.075302],
  '江西省': [115.892151, 28.676493],
  '山东省': [117.000923, 36.675807],
  '河南省': [113.665412, 34.757975],
  '湖北省': [114.298572, 30.584355],
  '湖南省': [112.982279, 28.19409],
  '广东省': [113.280637, 23.125178],
  '广西壮族自治区': [108.320004, 22.82402],
  '海南省': [110.330802, 20.031971],
  '重庆市': [106.504962, 29.533155],
  '四川省': [104.065735, 30.659462],
  '贵州省': [106.713478, 26.578343],
  '云南省': [102.712251, 25.040609],
  '西藏自治区': [91.132212, 29.660361],
  '陕西省': [108.948024, 34.263161],
  '甘肃省': [103.823557, 36.058039],
  '青海省': [101.778916, 36.623178],
  '宁夏回族自治区': [106.230909, 38.487222],
  '新疆维吾尔自治区': [87.617733, 43.792818],
  '台湾省': [121.509062, 25.044332],
  '香港特别行政区': [114.173355, 22.320048],
  '澳门特别行政区': [113.549132, 22.198951],
}

// ============================================================
//  Shared ECharts style fragments
// ============================================================
const chartTextStyle = {
  fontFamily: 'ChillHuoKai, "Noto Sans SC", "Microsoft YaHei", sans-serif',
}
const tooltipBase = {
  backgroundColor: 'rgba(250,247,239,0.96)',
  borderColor: '#A8C18A',
  borderWidth: 1,
  textStyle: {
    ...chartTextStyle,
    color: '#3A4D38',
    fontSize: 16,
  },
  extraCssText: 'box-shadow: 0 2px 12px rgba(81,109,51,0.15); border-radius: 6px;',
}
const axisLineStyle = { lineStyle: { color: '#A8C18A' } }
const axisLabelStyle = { ...chartTextStyle, color: '#5A6655', fontSize: 11 }
const splitLineStyle = { lineStyle: { color: 'rgba(168,193,138,0.2)', type: 'dashed' } }

// ============================================================
//  Roots view computeds
// ============================================================
const rootsOverview = computed(() => {
  const nat = getNational(rootsYear.value)
  const prevNat = getNational(rootsYear.value - 1)
  const provinceCount = provinceData.filter(p => {
    const yd = p.years.find(y => y.year === rootsYear.value)
    return yd && yd[metric.value] > 0
  }).length
  const yoy = nat && prevNat && prevNat.totalOutput > 0
    ? ((nat.totalOutput - prevNat.totalOutput) / prevNat.totalOutput) * 100
    : null
  return {
    gardenArea: nat?.gardenArea ?? 0,
    totalOutput: nat?.totalOutput ?? 0,
    yoy,
    provinceCount,
  }
})

const rootsMapData = computed(() => {
  return provinceData
    .map(p => {
      const yd = p.years.find(y => y.year === rootsYear.value)
      const v = yd ? yd[metric.value] : null
      if (isMissingVal(v)) return { name: p.province, value: 0 }
      return { name: p.province, value: typeof v === 'number' ? v : Number(v) }
    })
    .filter(d => !isMissingVal(d.value) && d.value > 0)
})

const PRODUCTION_START_YEAR = 2012
const PRODUCTION_END_YEAR = 2024
const MIN_PRODUCTION_RADIUS = 2
const MAX_PRODUCTION_RADIUS = 14

function getProvinceProduction(province, year) {
  const record = province?.years?.find(item => Number(item.year) === Number(year))
  if (!record || record.totalOutput == null || record.totalOutput === '') return null
  const value = Number(record.totalOutput)
  return Number.isFinite(value) ? value : null
}

function calculateProductionGrowth(currentValue, previousValue) {
  if (currentValue == null || previousValue == null || previousValue <= 0) return null
  const result = ((currentValue - previousValue) / previousValue) * 100
  return Number.isFinite(result) ? result : null
}

function getProductionGrowthColor(growthRate) {
  if (growthRate == null) return '#E3EBD9'
  if (growthRate >= 20) return '#355326'
  if (growthRate >= 5) return '#5F7D45'
  if (growthRate >= 0) return '#88A36B'
  if (growthRate >= -5) return '#AFC39A'
  return '#CDDABE'
}

function formatProductionGrowth(growthRate) {
  if (growthRate == null || !Number.isFinite(growthRate)) return '暂无可比数据'
  return `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`
}

const globalMaxProduction = Math.max(0, ...provinceData.flatMap(province => province.years
  .filter(item => item.year >= PRODUCTION_START_YEAR && item.year <= PRODUCTION_END_YEAR)
  .map(item => Number(item.totalOutput))
  .filter(value => Number.isFinite(value) && value > 0)))

function getProductionRadius(production) {
  if (production == null || production <= 0 || globalMaxProduction <= 0) return 0
  return MIN_PRODUCTION_RADIUS + Math.sqrt(production / globalMaxProduction) * (MAX_PRODUCTION_RADIUS - MIN_PRODUCTION_RADIUS)
}

const productionBubbleData = computed(() => provinceData.map(province => {
  const production = getProvinceProduction(province, rootsYear.value)
  const previousProduction = getProvinceProduction(province, rootsYear.value - 1)
  return {
    provinceName: province.province,
    production,
    previousProduction,
    growthRate: calculateProductionGrowth(production, previousProduction),
    center: PROVINCE_COORDS[province.province],
    hasData: production != null,
  }
}))

function createRootsGeoOption() {
  const sharedItemStyle = {
    areaColor: '#F7F4EB',
    borderColor: 'rgba(178,143,76,0.45)',
    borderWidth: 0.8,
  }

  return [
    {
      map: ROOTS_CHINA_MAP_NAME,
      projection: CHINA_ALBERS_PROJECTION,
      roam: true,
      zoom: currentGeoZoom.value,
      label: { show: false },
      itemStyle: sharedItemStyle,
      emphasis: {
        label: { ...chartTextStyle, show: true, color: '#3A4D38', fontWeight: 700 },
        itemStyle: { areaColor: '#EFE9DA', borderColor: '#B28F4C', borderWidth: 1.2 },
      },
    },
    {
      // 九段线在原始经纬度坐标中单独绘制，避免随主版图 Albers 投影发生倾斜。
      map: SOUTH_CHINA_SEA_MAP_NAME,
      roam: false,
      silent: true,
      // 缩小并移到右下空白区，避免与华南、东南沿海主版图重叠。
      layoutCenter: ['89%', '78%'],
      layoutSize: '17%',
      aspectScale: 1.4,
      label: { show: false },
      itemStyle: sharedItemStyle,
      regions: [{
        name: SOUTH_CHINA_SEA_FRAME_NAME,
        itemStyle: {
          areaColor: 'rgba(247,244,235,0.24)',
          borderColor: 'rgba(178,143,76,0.55)',
          borderWidth: 0.8,
        },
      }],
      emphasis: { disabled: true },
      z: 3,
    },
  ]
}

// 九段线以 lines 系列叠加在南海插图（geoIndex 1）上，坐标为经纬度，不参与主版图投影。
function createTendashSeries() {
  return {
    type: 'lines',
    coordinateSystem: 'geo',
    geoIndex: 1,
    polyline: true,
    silent: true,
    z: 4,
    lineStyle: {
      color: 'rgba(178,143,76,0.75)',
      width: 1,
    },
    data: tendashLines.value.map(coords => ({ coords })),
  }
}

// 九段线叠加在主地图（geoIndex 0，Albers 投影）上；坐标为经纬度，ECharts 内部经 CHINA_ALBERS_PROJECTION 自动投影。
function createTendashMainSeries() {
  return {
    type: 'lines',
    coordinateSystem: 'geo',
    geoIndex: 0,
    polyline: true,
    silent: true,
    z: 2,
    lineStyle: {
      color: '#AA853C',
      width: 0.8,
      type: 'dashed',
    },
    data: tendashLines.value.map(coords => ({ coords })),
  }
}

const rootsMapOption = computed(() => {
  const data = rootsMapData.value
  const yr = rootsYear.value

  // =================== 茶园面积 Tab：气泡图方案（geo 米色底图 + 散点） ===================
  if (metric.value === 'gardenArea') {
    // 计算覆盖率 & 组装散点数据（1千公顷 = 10 km²）
    const scatterList = []
    const coverageList = []
    let areaMax = 0
    data.forEach(d => {
      const areaKm2 = PROVINCE_AREAS[d.name]
      if (!areaKm2 || areaKm2 <= 0) return
      const coord = PROVINCE_COORDS[d.name]
      if (!coord) return
      const gardenKm2 = d.value * 10 // 千公顷 → km²
      const coverage = (gardenKm2 / areaKm2) * 100 // 覆盖率 %
      scatterList.push({
        name: d.name,
        // value 标准 3 元素：[lng, lat, coverage]；第2索引即 dimension=2 供 visualMap 染色
        value: [coord[0], coord[1], coverage],
        // 保留自定义属性供 tooltip / symbolSize 使用
        coverage,
        gardenArea: d.value,
      })
      coverageList.push(coverage)
      if (d.value > areaMax) areaMax = d.value
    })

    // 覆盖率最大值向上取整
    const coverageMaxRaw = coverageList.length ? Math.max(...coverageList) : 1
    const coverageMax = Math.max(1, Math.ceil(coverageMaxRaw))

    // 气泡大小映射（基于茶园面积绝对值，开方缩放使视觉更合理）
    const areaMaxRef = Math.max(areaMax, 1)
    const sizeMax = 22 // 最大气泡像素（整体调小，避免遮挡图例）
    const sizeMin = 4  // 最小气泡像素

    return {
      textStyle: chartTextStyle,
      tooltip: {
        ...tooltipBase,
        trigger: 'item',
        confine: true,
        extraCssText: 'max-width:220px; white-space:pre-wrap;',
        formatter: p => {
          if (p.componentType === 'geo') return `${p.name}<br/>（点击气泡查看省份详情）`
          const d = p.data
          if (!d || !d.gardenArea) return `${p.name}<br/>暂无数据`
          return `<b>${d.name}</b>（${yr}年）<br/>茶园面积：${fmt(d.gardenArea, 2)} 千公顷<br/>覆盖率：${fmt(d.coverage, 3)} %`
        },
      },
      geo: createRootsGeoOption(),
      visualMap: {
        min: 0,
        max: coverageMax,
        left: 12,
        bottom: 14,
        text: ['', '覆盖率'],
        textStyle: { ...chartTextStyle, color: '#5A6655', fontSize: 9 },
        // 茶金色系：与「茶园面积」按钮主题色 #B28F4C 一致
        inRange: { color: ['#FBF5E2', '#E8D5A5', '#C9A866', '#8E7038', '#5C4A22'] },
        calculable: false,
        itemWidth: 10,
        itemHeight: 60,
        // 柱子下方写明"覆盖率"，数值由 hover tooltip 显示，无需在图例上标 min/max
        formatter: v => `${v.toFixed(1)}%`,
        show: true,
        dimension: 2, // ★ 核心修复：绑定 value[2]=coverage，避免误取经度导致全白
        seriesIndex: 0, // 只作用于散点系列，不影响 geo
      },
      series: [{
        type: 'scatter',
        coordinateSystem: 'geo',
        geoIndex: 0,
        symbol: 'circle',
        // symbolSize 随地图缩放联动：zoom 越大气泡越大；除以 DEFAULT_GEO_ZOOM 保证初始视觉与以前一致
        symbolSize: (value, params) => {
          const area = params.data?.gardenArea || 0
          const ratio = Math.sqrt(area / areaMaxRef)
          const base = Math.max(sizeMin, sizeMin + (sizeMax - sizeMin) * ratio)
          const zoomFactor = currentGeoZoom.value / DEFAULT_GEO_ZOOM
          return base * zoomFactor
        },
        itemStyle: {
          borderColor: 'rgba(255,255,255,0.92)',
          borderWidth: 1,
          opacity: 0.9,
        },
        emphasis: {
          itemStyle: {
            borderColor: '#5C4A22',
            borderWidth: 2,
            opacity: 1,
            shadowBlur: 10,
            // 与茶金色视觉一致的金辉光晕
            shadowColor: 'rgba(178,143,76,0.4)',
          },
        },
        data: scatterList,
      },
      createTendashMainSeries(),
      createTendashSeries(),
      ],
    }
  }

  // =================== 茶叶产量 Tab：Albers 底图 + 比例气泡 ===================
  const outputScatterList = productionBubbleData.value
    .map(d => {
      const coord = d.center
      if (!coord || d.production == null || d.production <= 0) return null
      return {
        name: d.provinceName,
        value: [coord[0], coord[1], d.production],
        totalOutput: d.production,
        growthRate: d.growthRate,
      }
    })
    .filter(Boolean)

  return {
    textStyle: chartTextStyle,
    tooltip: {
      ...tooltipBase,
      trigger: 'item',
      confine: true,
      extraCssText: 'max-width:220px; white-space:pre-wrap;',
      formatter: p => {
        if (p.componentType === 'geo') return `${p.name}<br/>（点击气泡查看省份详情）`
        const d = p.data
        if (!d || !d.totalOutput) return `${p.name}<br/>暂无数据`
        return `<b>${d.name}</b>（${yr}年）<br/>茶叶产量：${fmt(d.totalOutput, 2)}万吨<br/>较上年增长率：${formatProductionGrowth(d.growthRate)}`
      },
    },
    geo: createRootsGeoOption(),
    visualMap: {
      min: -5,
      max: 20,
      left: 12,
      bottom: 18,
      text: ['', '同比增长率'],
      textStyle: { ...chartTextStyle, color: '#5A6655', fontSize: 9 },
      inRange: { color: ['#CDDABE', '#AFC39A', '#88A36B', '#5F7D45', '#355326'] },
      calculable: false,
      itemWidth: 10,
      itemHeight: 60,
      formatter: value => `${value > 0 ? '+' : ''}${fmt(value, 0)}%`,
      seriesIndex: [],
    },
    series: [{
      type: 'scatter',
      coordinateSystem: 'geo',
      geoIndex: 0,
      symbol: 'circle',
      symbolSize: (value, params) => {
        const base = getProductionRadius(params.data?.totalOutput) * 2
        const zoomFactor = currentGeoZoom.value / DEFAULT_GEO_ZOOM
        return base * zoomFactor
      },
      itemStyle: {
        color: params => getProductionGrowthColor(params.data?.growthRate),
        borderColor: 'rgba(255,255,255,0.94)',
        borderWidth: 1,
        opacity: 0.9,
      },
      emphasis: {
        itemStyle: {
          borderColor: '#B28F4C',
          borderWidth: 2,
          opacity: 1,
          shadowBlur: 10,
          shadowColor: 'rgba(81,109,51,0.35)',
        },
      },
      data: outputScatterList,
    },
    createTendashMainSeries(),
    createTendashSeries(),
    ],
  }
})

const rootsProvinceDetail = computed(() => {
  const prov = getProvince(selectedProvince.value)
  if (!prov) return null
  const yd = prov.years.find(y => y.year === rootsYear.value)
  // 只保留有该指标值的年份（去除 0/null/NaN 的年份点）
  const filteredYears = []
  const filteredValues = []
  prov.years.forEach(y => {
    const v = y[metric.value]
    if (!isMissingVal(v)) {
      filteredYears.push(y.year)
      filteredValues.push(typeof v === 'number' ? v : Number(v))
    }
  })
  return {
    name: prov.province,
    gardenArea: yd?.gardenArea || 0,
    totalOutput: yd?.totalOutput || 0,
    metricValue: yd ? (isMissingVal(yd[metric.value]) ? 0 : (yd[metric.value] || 0)) : 0,
    years: filteredYears,
    values: filteredValues,
  }
})

const rootsProvinceTrendOption = computed(() => {
  const detail = rootsProvinceDetail.value
  if (!detail || !detail.years.length) return {}
  // 估算合适的 Y 轴 max（给数据点和顶部留白）
  const values = detail.values.filter(v => typeof v === 'number' && !Number.isNaN(v))
  const vmax = values.length ? Math.max(...values) : 0
  const ymax = vmax > 0 ? Math.ceil(vmax * 1.18) : null
  // 标签较多时做间隔显示：≥12个年份才按间隔+旋转
  const yearCount = detail.years.length
  const interval = yearCount > 12 ? Math.floor(yearCount / 6) : 0
  return {
    textStyle: chartTextStyle,
    tooltip: {
      ...tooltipBase,
      trigger: 'axis',
      confine: true,
      extraCssText: 'max-width:220px; white-space:pre-wrap;',
      formatter: ps => {
        const v = ps[0]?.value
        const y = ps[0]?.axisValue ?? v?.axisValue
        return `<b>${y}年</b><br/>${metricLabel.value}：${fmt(v?.value ?? v?.data ?? ps[0]?.value, 2)} ${metricUnit.value}`
      },
    },
    grid: { containLabel: true, left: 52, right: 20, top: 24, bottom: 36 },
    xAxis: {
      type: 'category',
      data: detail.years,
      axisLine: axisLineStyle,
      axisLabel: {
        ...axisLabelStyle,
        fontSize: 10,
        interval: interval === 0 ? 'auto' : interval,
        rotate: yearCount > 10 ? 25 : 0,
        margin: 12,
      },
    },
    yAxis: {
      type: 'value',
      name: metricUnit.value,
      nameGap: 10,
      nameLocation: 'end',
      nameTextStyle: { ...chartTextStyle, color: '#5A6655', fontSize: 10, align: 'right' },
      max: ymax,
      axisLine: axisLineStyle,
      axisLabel: { ...axisLabelStyle, fontSize: 10 },
      splitLine: splitLineStyle,
    },
    series: [{
      type: 'line',
      data: detail.values,
      connectNulls: false,
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      showSymbol: true,
      lineStyle: { color: metricColor.value, width: 2.2 },
      itemStyle: { color: metricColor.value, borderWidth: 0 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: metricColor.value + '55' },
          { offset: 1, color: metricColor.value + '08' },
        ]),
      },
    }],
  }
})

const rootsRankingOption = computed(() => {
  const data = rootsMapData.value
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    .reverse()
  const values = data.map(d => d.value)
  const vmax = values.length ? Math.max(...values) : 0
  const xmax = vmax > 0 ? Math.ceil(vmax * 1.25) : null // 右端留白容纳柱顶标签
  return {
    textStyle: chartTextStyle,
    tooltip: {
      ...tooltipBase,
      trigger: 'axis',
      confine: true,
      extraCssText: 'max-width:220px; white-space:pre-wrap;',
      formatter: ps => `<b>${ps[0].name}</b><br/>${metricLabel.value}：${fmt(ps[0].value, 2)} ${metricUnit.value}`,
    },
    grid: { containLabel: true, left: 12, right: 16, top: 12, bottom: 24 },
    xAxis: {
      type: 'value',
      max: xmax,
      axisLine: axisLineStyle,
      axisLabel: { ...axisLabelStyle, fontSize: 10 },
      splitLine: splitLineStyle,
    },
    yAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLine: axisLineStyle,
      axisLabel: { ...axisLabelStyle, fontSize: 10 },
    },
    series: [{
      type: 'bar',
      data: data.map(d => ({
        value: d.value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: metricColor.value + '88' },
            { offset: 1, color: metricColor.value },
          ]),
          borderRadius: [0, 4, 4, 0],
        },
      })),
      barWidth: '60%',
      label: {
        ...chartTextStyle,
        show: true,
        position: 'right',
        color: '#5A6655',
        fontSize: 10,
        fontWeight: 600,
        formatter: p => fmt(p.value, 1),
      },
    }],
  }
})

function onMapClick(params) {
  if (params.name && getProvince(params.name)) {
    selectedProvince.value = params.name
  }
}

// ============================================================
//  Leaves view computeds — 已迁移至上方叶片·新生区域
//  （旧 leavesOverview / leavesPieOption / leavesTrendOption /
//   leavesStackedOption / leavesTeaCards 已删除，
//   不再使用茶种贸易数据渲染叶片面板）
// ============================================================

// ============================================================
//  Branches view computeds
// ============================================================
const branchesOverview = computed(() => {
  const yd = countryData.find(d => d.year === branchesYear.value)
  const pd = provinceExportData.find(d => d.year === branchesYear.value)
  const validCountries = yd ? yd.countries.filter(c => !isMissingVal(c.value)) : []
  const validProvinces = pd ? pd.provinces.filter(p => !isMissingVal(p.value)) : []
  const totalExport = validCountries.reduce((s, c) => s + (Number(c.value) || 0), 0)
  const sorted = validCountries.slice().sort((a, b) => Number(b.value) - Number(a.value))
  return {
    totalExport,
    topCountry: sorted.length ? sorted[0].name : '',
    countryCount: validCountries.length,
    provinceCount: validProvinces.length,
  }
})

const branchesSankeyOption = computed(() => {
  const yd = sankeyData.find(d => d.year === branchesYear.value)
  if (!yd) return {}
  // 只保留 value 有效（非 0/空）的连线
  const validLinks = yd.links
    .filter(l => !isMissingVal(l.value))
    .map(l => ({
      source: l.source,
      target: l.target,
      value: Number(l.value) || 0,
      lineStyle: { color: 'gradient', opacity: 0.35, curveness: 0.5 },
    }))
  // 节点悬浮时展示与当前节点相连的全部有效贸易线合计：
  // 省份统计所有出边，目的地统计所有入边。
  const provinceTotals = new Map()
  const destinationTotals = new Map()
  validLinks.forEach(link => {
    provinceTotals.set(link.source, (provinceTotals.get(link.source) || 0) + link.value)
    destinationTotals.set(link.target, (destinationTotals.get(link.target) || 0) + link.value)
  })
  // 只保留出现在有效 links 中的节点（避免孤立节点）
  const usedNames = new Set()
  validLinks.forEach(l => { usedNames.add(l.source); usedNames.add(l.target) })
  const validNodes = yd.nodes.filter(n => usedNames.has(n.name))
  return {
    textStyle: chartTextStyle,
    tooltip: {
      ...tooltipBase,
      trigger: 'item',
      confine: true,
      extraCssText: 'max-width:240px; white-space:pre-wrap;',
      formatter: p => {
        if (p.dataType === 'edge') {
          return `<b>${p.data.source} → ${p.data.target}</b><br/>出口额：${fmt(p.data.value / 1e8, 2)} 亿元`
        }
        const isProvince = p.data.category === 'province'
        const totalLabel = isProvince ? '出口总额' : '进口总额'
        return `<b>${p.name}</b><br/>${totalLabel}：${fmt(p.data.totalValue / 1e8, 2)} 亿元`
      },
    },
    series: [{
      type: 'sankey',
      left: 16,
      right: 96,
      top: 18,
      bottom: 18,
      nodeWidth: 14,
      nodeGap: 6,
      nodeAlign: 'justify',
      layoutIterations: 64,
      // 禁用节点拖动，固定左侧省份、右侧目的地位置
      draggable: false,
      emphasis: { focus: 'adjacency' },
      data: validNodes.map(n => ({
        name: n.name,
        category: n.category,
        totalValue: n.category === 'province'
          ? (provinceTotals.get(n.name) || 0)
          : (destinationTotals.get(n.name) || 0),
        itemStyle: { color: n.category === 'province' ? '#5C7C3A' : '#C8A155' },
        label: { ...chartTextStyle, color: '#3A4D38', fontSize: 10, width: 88, overflow: 'truncate' },
      })),
      links: validLinks,
      lineStyle: { curveness: 0.5 },
    }],
  }
})

const branchesCountryRankOption = computed(() => {
  const yd = countryData.find(d => d.year === branchesYear.value)
  if (!yd) return {}
  const sorted = yd.countries
    .filter(c => !isMissingVal(c.value))
    .map(c => ({ ...c, value: Number(c.value) || 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    .reverse()
  const values = sorted.map(c => c.value / 1e8)
  const vmax = values.length ? Math.max(...values) : 0
  const xmax = vmax > 0 ? Math.ceil(vmax * 1.28) : null
  return {
    textStyle: chartTextStyle,
    tooltip: {
      ...tooltipBase,
      trigger: 'axis',
      confine: true,
      extraCssText: 'max-width:220px; white-space:pre-wrap;',
      formatter: ps => `<b>${ps[0].name}</b><br/>出口额：${fmt(ps[0].value, 2)} 亿元`,
    },
    grid: { containLabel: true, left: 12, right: 16, top: 12, bottom: 24 },
    xAxis: {
      type: 'value',
      max: xmax,
      name: '亿元',
      nameGap: 10,
      nameLocation: 'end',
      nameTextStyle: { ...chartTextStyle, color: '#5A6655', fontSize: 10, align: 'right' },
      axisLine: axisLineStyle,
      axisLabel: { ...axisLabelStyle, fontSize: 10 },
      splitLine: splitLineStyle,
    },
    yAxis: {
      type: 'category',
      data: sorted.map(c => c.name),
      axisLine: axisLineStyle,
      axisLabel: { ...axisLabelStyle, fontSize: 10, width: 96, overflow: 'truncate' },
    },
    series: [{
      type: 'bar',
      data: sorted.map(c => ({
        value: c.value / 1e8,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#C8A15588' },
            { offset: 1, color: '#C8A155' },
          ]),
          borderRadius: [0, 4, 4, 0],
        },
      })),
      barWidth: '60%',
      label: {
        ...chartTextStyle,
        show: true,
        position: 'right',
        color: '#5A6655',
        fontSize: 10,
        fontWeight: 600,
        formatter: p => p.value.toFixed(2),
      },
    }],
  }
})

const branchesTrendOption = computed(() => {
  // 2026年未结束、数据不完整，从趋势图中剔除（不进x轴也不绘制该年点）
  const trend = countryData
    .filter(d => d.year < 2026)
    .map(d => {
      const total = d.countries.reduce((s, c) => {
        if (isMissingVal(c.value)) return s
        return s + (Number(c.value) || 0)
      }, 0)
      // 当年没有任何有效数据 → 返回 null，折线断档
      const noValid = d.countries.length === 0 || d.countries.every(c => isMissingVal(c.value))
      return {
        year: d.year,
        total: noValid ? null : total,
      }
    })
  const validItems = trend.filter(d => d.total !== null)
  const maxItem = validItems.length
    ? validItems.reduce((m, d) => (d.total > m.total ? d : m), validItems[0])
    : null
  const maxY = validItems.length ? (maxItem.total / 1e8) * 1.25 : null
  const yearCount = trend.length
  const interval = yearCount > 12 ? Math.floor(yearCount / 7) : 0
  return {
    textStyle: chartTextStyle,
    tooltip: {
      ...tooltipBase,
      trigger: 'axis',
      confine: true,
      extraCssText: 'max-width:220px; white-space:pre-wrap;',
      formatter: ps => {
        const v = ps[0]?.value
        if (v == null) return `<b>${ps[0]?.axisValue ?? ''}年</b><br/>暂无出口数据`
        return `<b>${ps[0]?.axisValue ?? ''}年</b><br/>出口总额：${fmt(v, 2)} 亿元`
      },
    },
    grid: { containLabel: true, left: 12, right: 12, top: 34, bottom: 34 },
    xAxis: {
      type: 'category',
      data: trend.map(d => d.year),
      axisLine: axisLineStyle,
      axisLabel: {
        ...axisLabelStyle,
        fontSize: 10,
        interval: interval === 0 ? 'auto' : interval,
        rotate: yearCount > 10 ? 25 : 0,
        margin: 12,
      },
    },
    yAxis: {
      type: 'value',
      name: '亿元',
      nameGap: 12,
      nameLocation: 'end',
      nameTextStyle: { ...chartTextStyle, color: '#5A6655', fontSize: 10, align: 'right' },
      max: maxY,
      axisLine: axisLineStyle,
      axisLabel: { ...axisLabelStyle, fontSize: 10 },
      splitLine: splitLineStyle,
    },
    series: [{
      type: 'line',
      data: trend.map(d => d.total == null ? null : d.total / 1e8),
      connectNulls: false,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#6B4423', width: 2.4 },
      itemStyle: { color: '#6B4423', borderWidth: 0 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(107,68,35,0.25)' },
          { offset: 1, color: 'rgba(107,68,35,0.03)' },
        ]),
      },
      markPoint: maxItem ? {
        symbol: 'pin',
        symbolSize: 44,
        data: [{ name: '最大值', value: (maxItem.total / 1e8).toFixed(1), xAxis: maxItem.year, yAxis: maxItem.total / 1e8 }],
        itemStyle: { color: '#B28F4C' },
        label: { ...chartTextStyle, color: '#fff', fontSize: 10 },
      } : undefined,
    }],
  }
})

const branchesProvinceShares = computed(() => {
  const yd = provinceExportData.find(d => d.year === branchesYear.value)
  if (!yd) return []
  const validProvinces = yd.provinces
    .filter(p => !isMissingVal(p.value))
    .map(p => ({ ...p, value: Number(p.value) || 0 }))
  const total = validProvinces.reduce((s, p) => s + p.value, 0)
  return validProvinces
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
    .map(p => ({
      name: p.name,
      value: p.value,
      valueYi: p.value / 1e8,
      pct: total > 0 ? (p.value / total) * 100 : 0,
    }))
})

// ============================================================
//  Lifecycle: load China GeoJSON and register map
// ============================================================
function onIntroDone() {
  introDone.value = true
}

onMounted(async () => {
  try {
    // 从本地加载省份 GeoJSON（与第3、4章一致）
    const provRes = await fetch(assetUrl('data/2/china-provinces.geojson'))
    const provGeo = await provRes.json()
    const provinceFeatures = provGeo.features.filter(feature => feature.properties?.adchar !== 'JD')
    const southChinaSeaFeatures = provGeo.features.filter(feature => feature.properties?.adchar === 'JD')
    const southChinaSeaFrame = {
      type: 'Feature',
      properties: { name: SOUTH_CHINA_SEA_FRAME_NAME },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [107.4, 2.5],
          [123.6, 2.5],
          [123.6, 25.5],
          [107.4, 25.5],
          [107.4, 2.5],
        ]],
      },
    }

    // 主版图使用 Albers；南海插图保留原始水平坐标，二者分别注册、叠加显示。
    echarts.registerMap(ROOTS_CHINA_MAP_NAME, { ...provGeo, features: provinceFeatures })
    echarts.registerMap(SOUTH_CHINA_SEA_MAP_NAME, {
      ...provGeo,
      features: [southChinaSeaFrame, ...southChinaSeaFeatures],
    })

    // 加载九段线（Albers 投影坐标），逆向投影回经纬度后叠加在南海插图上；失败时静默跳过。
    try {
      const dashRes = await fetch(assetUrl('data/1/china_tendash.geojson'))
      const dashGeo = await dashRes.json()
      const dashCoords = dashGeo.features?.[0]?.geometry?.coordinates || []
      tendashLines.value = dashCoords.map(line => line.map(pt => chinaAlbersTransformer.inverse(pt)))
    } catch (dashErr) {
      console.warn('九段线数据加载失败:', dashErr)
    }

    mapReady.value = true
  } catch (e) {
    console.warn('China GeoJSON 加载失败:', e)
    mapReady.value = true
  }
})
</script>

<style scoped>
/* ============================================================
   Chapter 5 · 今日茶境  (Redesign: Tree + Phone waterfall)
   ============================================================ */
.chapter-5 {
  position: relative;
  background: var(--c-paper-2);
}

.map-fullscreen.ch5-redesign {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 1.45s ease-in-out;
  overflow: hidden;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(580px, 1.1fr) minmax(360px, 440px);
  gap: 16px;
  padding: 1.6rem 3rem 1.6rem 1rem;
  background-color: #EFE9DA;
  background-image:
    linear-gradient(
      90deg,
      rgba(247, 244, 235, 0.04) 0%,
      rgba(247, 244, 235, 0.08) 52%,
      rgba(247, 244, 235, 0.24) 100%
    ),
    url('/data/5/today-tea-garden-bg-v4.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: 30% center;
}
.map-fullscreen.ch5-redesign.show {
  opacity: 1;
}

/* ============ LEFT · Tea tree ============ */
.ch5-left {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  position: relative;
  z-index: 1;
}

.ch5-tree-scene.single-tree {
  background: transparent;
  border: 0;
  border-radius: 0;
  overflow: visible;
  box-shadow: none;
  width: 100%;
  max-width: 640px;
  aspect-ratio: 600 / 820;
  max-height: calc(100vh - 60px - 3.2rem);
  transform: translateX(calc(clamp(40px, 3.8vw, 72px) + 20px));
}

.tree-svg {
  display: block;
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  overflow: visible;
  background: transparent;
  pointer-events: none;
}

/* ---------- Click zones ---------- */
.click-zone {
  transition: filter 0.25s ease;
  pointer-events: all;
  cursor: pointer;
}
.click-zone.hover {
  filter: drop-shadow(0 0 10px rgba(255,255,255,0.7));
}
.click-zone.active {
  filter: drop-shadow(0 0 14px rgba(255,255,255,0.95));
}

/* 扩散圆动效 */
.ripple {
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
}
.ripple-1 { animation: ripple-expand 2.4s ease-out 0s infinite; }
.ripple-2 { animation: ripple-expand 2.4s ease-out 0.8s infinite; }
.ripple-3 { animation: ripple-expand 2.4s ease-out 1.6s infinite; }

@keyframes ripple-expand {
  0% {
    opacity: 0.9;
    transform: scale(0.6);
  }
  70% {
    opacity: 0.35;
  }
  100% {
    opacity: 0;
    transform: scale(3.8);
  }
}

/* active时加速 + 更亮 */
.click-zone.active .ripple-1 { animation-duration: 1.6s; }
.click-zone.active .ripple-2 { animation-duration: 1.6s; }
.click-zone.active .ripple-3 { animation-duration: 1.6s; }

.zone-tag text {
  font-family: var(--font-huiwen);
  pointer-events: none;
}

/* ============ RIGHT · Phone / Tablet frame ============ */
.ch5-right {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  position: relative;
  z-index: 2;
}

.phone-frame {
  width: 100%;
  max-width: 440px;
  height: calc(100vh - 60px - 3.2rem);
  max-height: 880px;
  background: #F5F0E1;
  border-radius: 44px;
  padding: 12px;
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.25),
    0 0 0 2px #E8E1CB,
    inset 0 0 0 1px rgba(255,255,255,0.8);
  position: relative;
  display: flex;
  flex-direction: column;
  transition: all 0.5s ease;
}

/* 不同面板对应颜色边框发光（白色版本调整色调） */
.phone-frame.panel-roots   { box-shadow: 0 30px 60px rgba(178,143,76,0.22), 0 0 0 2px #E8E1CB, 0 0 26px rgba(178,143,76,0.32), inset 0 0 0 1px rgba(255,255,255,0.9); }
.phone-frame.panel-leaves  { box-shadow: 0 30px 60px rgba(92,124,58,0.22), 0 0 0 2px #E8E1CB, 0 0 26px rgba(92,124,58,0.32),  inset 0 0 0 1px rgba(255,255,255,0.9); }
.phone-frame.panel-branches{ box-shadow: 0 30px 60px rgba(107,68,35,0.22), 0 0 0 2px #E8E1CB, 0 0 26px rgba(107,68,35,0.32), inset 0 0 0 1px rgba(255,255,255,0.9); }

/* 顶部刘海 */
.phone-notch {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 28px;
  background: #ECE3CC;
  border-radius: 18px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.06);
}
.notch-speaker {
  width: 40px; height: 6px;
  background: #C8BFAD;
  border-radius: 4px;
}
.notch-cam {
  width: 12px; height: 12px;
  background: radial-gradient(circle at 35% 35%, #7E8793 0%, #2E2E34 70%);
  border-radius: 50%;
}

/* 状态栏 */
.phone-statusbar {
  height: 44px;
  padding: 0 22px 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #3A3428;
  font-size: 13px;
  font-weight: 600;
  background: transparent;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  flex-shrink: 0;
  z-index: 10;
  position: relative;
}
.sb-time { min-width: 40px; }
.sb-title {
  font: 600 14px/1 var(--font-huiwen);
  letter-spacing: 0.08em;
  color: #3A3428;
  text-shadow: 0 0 6px rgba(255,255,255,0.4);
}
.sb-signal { font-size: 10px; opacity: 0.7; color: #3A3428; }

/* 屏幕内部：外层裁切，保证滚动条不超出手机屏幕内边缘 */
.phone-screen-wrap {
  flex: 1;
  overflow: hidden;
  border-radius: 32px;
  position: relative;
  background: linear-gradient(180deg, #F4F0E3 0%, #EDE8D4 100%);
}
.phone-screen {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 14px 18px;
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: #B8B484 transparent;
  scrollbar-gutter: stable;
  --serif: var(--font-huiwen);
  --sans: var(--font-huiwen);
}

.phone-screen::-webkit-scrollbar { width: 4px; }
.phone-screen::-webkit-scrollbar-track { background: transparent; }
.phone-screen::-webkit-scrollbar-thumb {
  background: #B8B484;
  border-radius: 2px;
  border: 6px solid transparent; /* 让滚动条缩在内部，不超出 */
}

/* 底部 home indicator */
.phone-homebar {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.phone-homebar::after {
  content: "";
  width: 120px;
  height: 5px;
  background: #B8B484;
  border-radius: 3px;
}

/* ============================================================
   Waterfall panels · 瀑布流排布
   ============================================================ */
.waterfall-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: fadeSlideUp 0.45s ease;
}

@keyframes fadeSlideUp {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Controls 小控件 */
.wf-controls.wf-ctrl-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 6px 2px 4px;
}

/* 小版 Controls */
.ch5-metric-toggle.small {
  display: flex;
  gap: 0;
  border: 1px solid rgba(165,163,122,0.55);
  border-radius: 7px;
  overflow: hidden;
  background: rgba(255,255,255,0.7);
}
.ch5-metric-toggle.small .toggle-btn {
  padding: 4px 8px;
  font-family: var(--font-body);
  font-size: 11px;
  letter-spacing: 0;
  border: none;
}
.ch5-metric-toggle.small .toggle-btn:not(:last-child) {
  border-right: 1px solid rgba(165,163,122,0.4);
}

.ch5-year-slider.small {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ch5-year-slider.small .slider-input {
  -webkit-appearance: none;
  appearance: none;
  width: 120px;
  height: 4px;
  border-radius: 2px;
  /* 自定义双段渐变：已选段 = 主题色，未选段 = 白色。
   * CSS 变量 --ch5-slider-fill 是已选比例（百分比字符串），由模板动态注入。
   * 这里禁用浏览器 accent-color 默认填充（用 transparent 配合 background-image 完整覆盖）。*/
  accent-color: transparent;
  background-image: linear-gradient(
    to right,
    var(--ch5-slider-accent, #B28F4C) 0,
    var(--ch5-slider-accent, #B28F4C) var(--ch5-slider-fill, 0%),
    #FFFFFF var(--ch5-slider-fill, 0%),
    #FFFFFF 100%
  );
  outline: none;
  cursor: pointer;
}
.ch5-year-slider.small .slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px; height: 14px;
  border-radius: 50%;
  border: 1.5px solid var(--ch5-slider-accent, #B28F4C);
  background: #FFFFFF;
  box-sizing: border-box;
  cursor: pointer;
  margin-top: 0; /* 居中于 4px track */
}
.ch5-year-slider.small .slider-input::-moz-range-thumb {
  width: 14px; height: 14px;
  border-radius: 50%;
  border: 1.5px solid var(--ch5-slider-accent, #B28F4C);
  background: #FFFFFF;
  box-sizing: border-box;
  cursor: pointer;
}
.ch5-year-slider.small .slider-input::-moz-range-track {
  height: 4px;
  border: none;
  border-radius: 2px;
  background: #FFFFFF;
}
.ch5-year-slider.small .slider-input::-moz-range-progress {
  height: 4px;
  border: none;
  border-radius: 2px;
  background: var(--ch5-slider-accent, #B28F4C);
}
.ch5-year-slider.small .slider-value {
  font-size: 13px;
  min-width: 36px;
}

.ch5-year-select.small .select-input {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 6px;
}
.ch5-year-select.small .slider-label { display: none; }

/* ============ 概览 grid 手机版 ============ */
.wf-overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.ch5-overview-card.small-card {
  background: linear-gradient(135deg, rgba(250,247,239,0.92) 0%, rgba(245,241,232,0.92) 100%);
  border: 1px solid rgba(165,163,122,0.35);
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: 0 2px 8px rgba(81,109,51,0.06);
}
.ch5-overview-card.small-card .ov-label {
  font-size: 11px;
  margin-bottom: 4px;
  letter-spacing: 0.03em;
}
/* 枝条板块概览标题单独增强可读性，不影响根系板块的同类卡片。 */
.panel-branches .ch5-overview-card.small-card .ov-label {
  font-size: 13px;
  line-height: 1.35;
  font-weight: 600;
}
.ch5-overview-card.small-card .ov-unit { font-size: 10px; }
.ch5-overview-card.small-card .ch5-stat-num {
  font-size: 1.25rem;
}

/* ============ 通用 card 手机版 ============ */
.ch5-card.small-card {
  background: linear-gradient(135deg, rgba(250,247,239,0.95) 0%, rgba(245,241,232,0.95) 100%);
  border: 1px solid rgba(165,163,122,0.35);
  border-radius: 14px;
  padding: 10px 12px 12px;
  box-shadow: 0 2px 10px rgba(81,109,51,0.06);
}

.card-title-sm {
  font: 600 13px/1 var(--font-huiwen);
  color: var(--c-olive);
  letter-spacing: 0.04em;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px dashed rgba(165,163,122,0.4);
}

.chart-container {
  width: 100%;
  min-width: 0;
  margin-inline: auto;
}

/* 排名图与出口趋势图始终占满卡片内容宽度，避免绘图区偏向右侧。 */
.chart-ranking.small,
.chart-country-rank.small,
.chart-branch-trend.small {
  width: 100%;
  min-width: 0;
  margin-inline: auto;
}

.ch5-map-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font: 400 12px/1 var(--sans);
  color: var(--muted);
}

.empty-hint.small {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  font-size: 12px;
  color: var(--muted);
}

/* province detail 小版 */
.province-detail-body.small {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.province-mini-stats.small {
  display: flex;
  gap: 6px;
}
.province-mini-stats.small .mini-stat {
  padding: 6px 4px;
  border-radius: 6px;
  border: 1px solid rgba(165,163,122,0.3);
}
.province-mini-stats.small .mini-label { font-size: 10px; margin-bottom: 2px; }
.province-mini-stats.small .mini-val { font-size: 12px; }
.province-mini-stats.small .mini-val small { font-size: 9px; }

/* 图表行 */
.wf-charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

/* ============ 叶片茶种卡片 小版 ============ */
.ch5-tea-cards.small-wrap {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.ch5-tea-card.small {
  --tea-color: var(--c-olive);
  background: linear-gradient(135deg, rgba(250,247,239,0.95) 0%, rgba(245,241,232,0.95) 100%);
  border: 1px solid rgba(165,163,122,0.3);
  border-top: 3px solid var(--tea-color);
  border-radius: 10px;
  padding: 8px 10px;
}
.ch5-tea-card.small .tea-card-icon { font-size: 16px; }
.ch5-tea-card.small .tea-card-name { font-size: 13px; }
.ch5-tea-card.small .tea-card-en { font-size: 10px; }
.ch5-tea-card.small .tea-card-desc { font-size: 11px; line-height: 1.5; margin: 0 0 4px; }
.ch5-tea-card.small .tea-card-val { padding-top: 4px; }
.ch5-tea-card.small .val-num { font-size: 14px; }
.ch5-tea-card.small .val-unit { font-size: 10px; }

/* ============ 枝条 省份占比 小版 ============ */
.ch5-province-shares.small-wrap { margin-top: 2px; }
.ch5-province-shares.small-wrap .shares-title {
  font-size: 13px;
  margin-bottom: 8px;
}
.shares-grid.small {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ch5-share-card.small {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(250,247,239,0.95) 0%, rgba(245,241,232,0.95) 100%);
  border: 1px solid rgba(165,163,122,0.3);
  border-radius: 8px;
  padding: 6px 8px;
}
.ch5-share-card.small .share-rank {
  width: 22px; height: 22px;
  font-size: 11px;
}
.ch5-share-card.small .share-name { font-size: 12px; }
.ch5-share-card.small .share-val { font-size: 10px; margin-bottom: 2px; }
.ch5-share-card.small .share-bar-wrap { height: 4px; }

/* ============================================================
   叶片·新生 · 局部样式（仅作用于叶片面板，不影响其他面板）
   ============================================================ */

/* ---- 1. 标题与导语 ---- */
.lv-hero {
  padding: 12px 4px 6px;
  text-align: center;
}
.lv-hero-kicker {
  display: inline-block;
  font: 700 15px/1 var(--font-huiwen);
  letter-spacing: 0.12em;
  color: #fff;
  background: linear-gradient(135deg, #5C7C3A 0%, #516D33 100%);
  padding: 6px 16px;
  border-radius: 14px;
  margin-bottom: 10px;
  box-shadow: 0 2px 6px rgba(92,124,58,0.18);
}
.panel-roots .lv-hero-kicker {
  background: linear-gradient(135deg, #B28F4C 0%, #8F7137 100%);
  box-shadow: 0 2px 6px rgba(178,143,76,0.22);
}
.panel-branches .lv-hero-kicker {
  background: linear-gradient(135deg, #8A5A2E 0%, #6B4423 100%);
  box-shadow: 0 2px 6px rgba(107,68,35,0.22);
}
.lv-hero-sub {
  font-size: 11px;
  color: #5A6655;
  letter-spacing: 0.02em;
  margin-bottom: 8px;
}
.lv-hero-intro {
  font-size: 12px;
  line-height: 1.6;
  color: #3A3428;
  text-align: justify;
  padding: 0 4px;
}

/* ---- 2. 先看结论：3张分析卡 ---- */
.lv-conclusion-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}
.lv-conclusion-card {
  background: linear-gradient(135deg, rgba(250,247,239,0.96) 0%, rgba(245,241,232,0.96) 100%);
  border: 1px solid rgba(165,163,122,0.4);
  border-left: 4px solid #5C7C3A;
  border-radius: 10px;
  padding: 10px 12px;
}
.lv-cc-title {
  font: 800 13px/1 var(--font-huiwen);
  color: #3A4D38;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}
.lv-cc-scale-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 6px;
}
.lv-cc-scale-val {
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.lv-cc-num {
  font: 900 18px/1 var(--font-huiwen);
  color: #516D33;
}
.lv-cc-unit {
  font-size: 10px;
  color: #8A8270;
}
.lv-cc-arrow {
  font-size: 18px;
  color: #B28F4C;
  font-weight: 700;
}
.lv-cc-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #B28F4C 0%, #C8A155 100%);
  padding: 2px 8px;
  border-radius: 6px;
  margin-bottom: 4px;
}
.lv-cc-phase-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 4px;
}
.lv-cc-phase {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 6px;
  background: rgba(195,214,172,0.2);
  border-radius: 5px;
}
.lv-cc-phase-period { font-size: 10px; color: #5A6655; }
.lv-cc-phase-cagr {
  font: 700 12px/1 var(--font-huiwen);
  color: #516D33;
}
.lv-cc-metrics {
  display: flex;
  justify-content: space-around;
  margin-bottom: 4px;
}
.lv-cc-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.lv-cc-metric-label { font-size: 9px; color: #8A8270; }
.lv-cc-metric-change {
  font: 700 13px/1 var(--font-huiwen);
  color: #5C7C3A;
}
.lv-cc-metric-change.neg { color: #A8453A; }
.lv-cc-desc {
  font-size: 10.5px;
  color: #5A6655;
  line-height: 1.5;
  margin-top: 4px;
}

/* ---- 3/5/6. 图表区块 ---- */
.lv-chart-block {
  margin-top: 10px;
}
.lv-chart-title {
  font: 700 12px/1.4 var(--font-huiwen);
  color: #3A4D38;
  letter-spacing: 0.02em;
  padding: 6px 2px 8px;
  text-align: center;
}
.ch5-chart-unit {
  margin: 2px 2px 6px;
  font-size: 10.5px;
  color: #8A8270;
  text-align: right;
  padding-right: 4px;
  letter-spacing: 0.02em;
}
.lv-chart-note {
  margin-top: 6px;
  padding: 7px 9px;
  background: linear-gradient(135deg, rgba(239,233,218,0.5) 0%, rgba(247,244,235,0.5) 100%);
  border-left: 3px solid #C3C19A;
  border-radius: 0 6px 6px 0;
  font-size: 10.5px;
  line-height: 1.55;
  color: #3A3428;
}
.lv-chart-note-approx {
  border-left-color: #B28F4C;
  font-size: 10px;
  color: #6B5D3A;
  margin-bottom: 4px;
}

/* ---- 4. 三阶段读图 ---- */
.lv-stages { margin-top: 10px; }
.lv-stages-title {
  font: 700 13px/1 var(--font-huiwen);
  color: #3A4D38;
  letter-spacing: 0.04em;
  padding: 4px 2px 8px;
  text-align: center;
}
.lv-stages-title span {
  display: inline-block;
  text-align: left;
  line-height: 1.35;
}
.lv-stage-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lv-stage-card {
  display: flex;
  gap: 8px;
  background: linear-gradient(135deg, rgba(250,247,239,0.95) 0%, rgba(245,241,232,0.95) 100%);
  border: 1px solid rgba(165,163,122,0.35);
  border-left: 4px solid var(--stage-color, #5C7C3A);
  border-radius: 10px;
  padding: 10px 11px;
}
.lv-stage-num {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--stage-color, #5C7C3A);
  color: #fff;
  font: 800 12px/22px var(--font-huiwen);
  text-align: center;
  flex-shrink: 0;
}
.lv-stage-body { flex: 1; min-width: 0; }
.lv-stage-period {
  font-size: 11px;
  color: #8A8270;
  font-weight: 600;
  margin-bottom: 2px;
}
.lv-stage-name {
  font: 700 13px/1.2 var(--font-huiwen);
  color: #3A4D38;
  margin-bottom: 5px;
}
.lv-stage-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
}
.lv-stage-metric {
  font-size: 11px;
  color: #5A6655;
  line-height: 1.45;
}
.lv-stage-cagr {
  font-size: 11px;
  font-weight: 700;
  color: #B28F4C;
  padding: 2px 6px;
  background: rgba(178,143,76,0.12);
  border-radius: 4px;
}
.lv-stage-conclusion {
  font-size: 11px;
  color: #5A6655;
  line-height: 1.65;
}

/* ---- 7. 六种新表达 ---- */
.lv-products { margin-top: 10px; }
.lv-products-title {
  font: 700 13px/1 var(--font-huiwen);
  color: #3A4D38;
  letter-spacing: 0.04em;
  padding: 4px 2px 8px;
  text-align: center;
}
.lv-product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.lv-product-card {
  background: linear-gradient(135deg, rgba(250,247,239,0.95) 0%, rgba(245,241,232,0.95) 100%);
  border: 1px solid rgba(165,163,122,0.35);
  border-radius: 10px;
  padding: 8px 9px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
}
.lv-product-card:hover,
.lv-product-card:active,
.lv-product-card.is-active {
  background: linear-gradient(135deg, #5C7C3A 0%, #3F582C 100%);
  border-color: rgba(247,244,235,0.72);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(63,88,44,0.24);
}
.lv-product-card:hover .lv-prod-ord,
.lv-product-card:active .lv-prod-ord,
.lv-product-card.is-active .lv-prod-ord {
  background: #F7F4EB;
  color: #516D33;
}
.lv-product-card:hover .lv-prod-type,
.lv-product-card:active .lv-prod-type,
.lv-product-card.is-active .lv-prod-type {
  color: #FFFDF7;
}
.lv-product-card:hover .lv-prod-subtitle,
.lv-product-card:active .lv-prod-subtitle,
.lv-product-card.is-active .lv-prod-subtitle {
  color: #F0D79A;
}
.lv-product-card:hover .lv-prod-chip,
.lv-product-card:active .lv-prod-chip,
.lv-product-card.is-active .lv-prod-chip {
  background: rgba(247,244,235,0.16);
  color: #FFFDF7;
  box-shadow: inset 0 0 0 1px rgba(247,244,235,0.2);
}
.lv-product-card.expanded {
  grid-column: 1 / -1;
  border-color: rgba(92,124,58,0.6);
  box-shadow: 0 4px 14px rgba(92,124,58,0.14);
}
.lv-prod-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}
.lv-prod-ord {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: linear-gradient(135deg, #5C7C3A 0%, #516D33 100%);
  color: #FFF8E8;
  font: 700 10px/18px var(--font-huiwen);
  text-align: center;
  flex-shrink: 0;
}
.lv-prod-type {
  font: 700 12px/1 var(--font-huiwen);
  color: #3A4D38;
}
.lv-prod-subtitle {
  font-size: 10px;
  color: #B28F4C;
  font-weight: 600;
  margin-bottom: 4px;
}
.lv-prod-repr {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}
.lv-prod-chip {
  font-size: 9.5px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(195,193,154,0.25);
  color: #516D33;
}
.lv-prod-more {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed rgba(165,163,122,0.4);
}
.lv-prod-more-label,
.lv-prod-explain-label,
.lv-prod-dims-label {
  font-size: 9px;
  color: #8A8270;
  margin-bottom: 2px;
}
.lv-prod-more-items {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-bottom: 6px;
}
.lv-prod-explain {
  margin-bottom: 4px;
}
.lv-prod-explain-text {
  font-size: 10px;
  color: #5A6655;
  line-height: 1.5;
}
.lv-prod-dims-text {
  font-size: 9.5px;
  color: #5A6655;
  line-height: 1.4;
}
/* ---- 六表达详情卡弹层（仅手机内遮罩）---- */
.lv-detail-modal {
  position: absolute;
  inset: 0;
  z-index: 50;
  background: rgba(58, 77, 56, 0.55);
  backdrop-filter: blur(1.5px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px 13px 18px;
  box-sizing: border-box;
}
.lv-detail-card {
  width: 100%;
  max-height: calc(100% - 2px);
  background: #F9F6ED;
  border: 1px solid rgba(165, 163, 122, 0.55);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(58, 52, 40, 0.2);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.lv-detail-close {
  position: absolute;
  top: 8px;
  right: 10px;
  width: 26px;
  height: 26px;
  border: none;
  background: rgba(247, 244, 235, 0.92);
  color: #516D33;
  border-radius: 50%;
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
  cursor: pointer;
  z-index: 5;
  box-shadow: 0 2px 9px rgba(25, 34, 22, 0.16);
  transition: transform 0.15s ease, background-color 0.15s ease;
}
.lv-detail-close:hover {
  background: #FFFDF7;
  transform: scale(1.05);
}
.lv-detail-media {
  position: relative;
  flex: 0 0 auto;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background: #E9E3D4;
}
.lv-detail-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  filter: saturate(0.92) contrast(0.97);
}
.lv-detail-heading {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 42px 10px 15px;
  border-bottom: 1px solid rgba(165, 163, 122, 0.28);
  background: linear-gradient(90deg, rgba(247, 244, 235, 0.98), rgba(238, 232, 216, 0.94));
}
.lv-detail-title-group {
  min-width: 0;
}
.lv-detail-ord {
  flex: 0 0 27px;
  width: 27px;
  height: 27px;
  border-radius: 8px;
  background: rgba(81, 109, 51, 0.96);
  color: #FFF8E8;
  font: 800 13px/27px var(--font-huiwen);
  text-align: center;
  box-shadow: 0 2px 8px rgba(26, 37, 24, 0.2);
}
.lv-detail-type {
  font: 800 17px/1.1 var(--font-huiwen);
  color: #344B2A;
  letter-spacing: 0.04em;
}
.lv-detail-subtitle {
  margin-top: 5px;
  font-size: 11.5px;
  line-height: 1.2;
  color: #A57D36;
  font-weight: 600;
}
.lv-detail-body {
  padding: 13px 15px 15px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}
.lv-detail-sec-label {
  margin-bottom: 5px;
  color: #7E755F;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
}
.lv-detail-summary {
  margin: 0 0 12px;
  padding: 9px 11px;
  border-left: 4px solid #5C7C3A;
  border-radius: 0 9px 9px 0;
  background: linear-gradient(135deg, rgba(92, 124, 58, 0.1), rgba(216, 205, 175, 0.17));
}
.lv-detail-summary p {
  margin: 0;
  color: #394235;
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1.72;
}
.lv-detail-products {
  margin-bottom: 12px;
}
.lv-detail-product-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.lv-detail-product-chips .lv-prod-chip {
  padding: 4px 7px;
  border: 1px solid rgba(165, 163, 122, 0.22);
  background: rgba(216, 205, 175, 0.28);
}
.lv-detail-explain {
  margin-bottom: 12px;
}
.lv-detail-explain-text {
  padding: 8px 10px;
  border: 1px solid rgba(165, 163, 122, 0.24);
  border-radius: 8px;
  background: rgba(255, 253, 247, 0.72);
  color: #3A3428;
  font-size: 11px;
  line-height: 1.65;
}
.lv-detail-source {
  padding: 0 2px;
  color: #8A8270;
  font-size: 9.5px;
  line-height: 1.5;
}
.lv-detail-source-label { font-weight: 500; }
.lv-detail-source-name {
  color: #5A6655;
  text-decoration-color: rgba(90, 102, 85, 0.34);
  text-underline-offset: 2px;
}
.lv-detail-source-name:hover {
  color: #516D33;
}

/* 弹层过渡动画 */
.lv-fade-enter-active, .lv-fade-leave-active {
  transition: all 0.2s ease;
}
.lv-fade-enter-from, .lv-fade-leave-to {
  opacity: 0;
}
.lv-fade-enter-from .lv-detail-card,
.lv-fade-leave-to .lv-detail-card {
  transform: translateY(14px) scale(0.98);
}

/* 确保弹层容器 .panel-leaves 有相对定位 */
.panel-leaves {
  position: relative;
}

/* ---- 8. 总结与数据来源 ---- */
.lv-summary { margin-top: 10px; }
.lv-summary-quote {
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(81,109,51,0.08) 0%, rgba(92,124,58,0.12) 100%);
  border-radius: 10px;
  font: 500 11px/1.7 var(--font-huiwen);
  color: #3A4D38;
  text-align: center;
  letter-spacing: 0.02em;
  border: 1px dashed rgba(92,124,58,0.35);
  margin-bottom: 6px;
}
.lv-source-note {
  font-size: 9.5px;
  color: #8A8270;
  line-height: 1.5;
  padding: 4px 2px;
  text-align: justify;
}

/* ============================================================
   响应式：窄屏时上下堆叠
   ============================================================ */
@media (max-width: 1100px) {
  .map-fullscreen.ch5-redesign {
    grid-template-columns: 1fr;
    overflow-y: auto;
    gap: 16px;
    padding: 1rem 1.2rem 2rem;
    background-position: 34% center;
  }
  .ch5-tree-scene.single-tree {
    max-height: 560px;
    margin: 0 auto;
    transform: translateX(calc(clamp(22px, 2.8vw, 36px) + 20px));
  }
  .phone-frame {
    max-height: 760px;
    margin: 0 auto;
  }
}

/* English sizes follow the corresponding Chinese sizes, minus 1px. */
.english-copy .phone-statusbar {font-size:calc(13px - 1px);}
.english-copy .sb-signal {font-size:calc(10px - 1px);}
.english-copy .ch5-metric-toggle.small .toggle-btn {font-size:calc(11px - 1px);}
.english-copy .ch5-year-slider.small .slider-value {font-size:calc(13px - 1px);}
.english-copy .ch5-year-select.small .select-input {font-size:calc(12px - 1px);}
.english-copy .ch5-overview-card.small-card .ov-label {font-size:calc(11px - 1px);}
.english-copy .panel-branches .ch5-overview-card.small-card .ov-label {font-size:calc(13px - 1px);}
.english-copy .ch5-overview-card.small-card .ov-unit {font-size:calc(10px - 1px);}
.english-copy .ch5-overview-card.small-card .ch5-stat-num {font-size:calc(1.25rem - 1px);}
.english-copy .empty-hint.small {font-size:calc(12px - 1px);}
.english-copy .province-mini-stats.small .mini-label {font-size:calc(10px - 1px);}
.english-copy .province-mini-stats.small .mini-val {font-size:calc(12px - 1px);}
.english-copy .province-mini-stats.small .mini-val small {font-size:calc(9px - 1px);}
.english-copy .ch5-tea-card.small .tea-card-icon {font-size:calc(16px - 1px);}
.english-copy .ch5-tea-card.small .tea-card-name {font-size:calc(13px - 1px);}
.english-copy .ch5-tea-card.small .tea-card-en {font-size:calc(10px - 1px);}
.english-copy .ch5-tea-card.small .tea-card-desc {font-size:calc(11px - 1px);}
.english-copy .ch5-tea-card.small .val-num {font-size:calc(14px - 1px);}
.english-copy .ch5-tea-card.small .val-unit {font-size:calc(10px - 1px);}
.english-copy .ch5-province-shares.small-wrap .shares-title {font-size:calc(13px - 1px);}
.english-copy .ch5-share-card.small .share-rank {font-size:calc(11px - 1px);}
.english-copy .ch5-share-card.small .share-name {font-size:calc(12px - 1px);}
.english-copy .ch5-share-card.small .share-val {font-size:calc(10px - 1px);}
.english-copy .lv-hero-sub {font-size:calc(11px - 1px);}
.english-copy .lv-hero-intro {font-size:calc(12px - 1px);}
.english-copy .lv-cc-unit {font-size:calc(10px - 1px);}
.english-copy .lv-cc-arrow {font-size:calc(18px - 1px);}
.english-copy .lv-cc-badge {font-size:calc(10px - 1px);}
.english-copy .lv-cc-phase-period {font-size:calc(10px - 1px);}
.english-copy .lv-cc-metric-label {font-size:calc(9px - 1px);}
.english-copy .lv-cc-desc {font-size:calc(10.5px - 1px);}
.english-copy .ch5-chart-unit {font-size:calc(10.5px - 1px);}
.english-copy .lv-chart-note {font-size:calc(10.5px - 1px);}
.english-copy .lv-chart-note-approx {font-size:calc(10px - 1px);}
.english-copy .lv-stage-period {font-size:calc(11px - 1px);}
.english-copy .lv-stage-metric {font-size:calc(11px - 1px);}
.english-copy .lv-stage-cagr {font-size:calc(11px - 1px);}
.english-copy .lv-stage-conclusion {font-size:calc(11px - 1px);}
.english-copy .lv-prod-subtitle {font-size:calc(10px - 1px);}
.english-copy .lv-prod-chip {font-size:calc(9.5px - 1px);}
.english-copy .lv-prod-more-label,.english-copy .lv-prod-explain-label,.english-copy .lv-prod-dims-label {font-size:calc(9px - 1px);}
.english-copy .lv-prod-explain-text {font-size:calc(10px - 1px);}
.english-copy .lv-prod-dims-text {font-size:calc(9.5px - 1px);}
.english-copy .lv-detail-close {font-size:calc(16px - 1px);}
.english-copy .lv-detail-subtitle {font-size:calc(11.5px - 1px);}
.english-copy .lv-detail-sec-label {font-size:calc(9.5px - 1px);}
.english-copy .lv-detail-summary p {font-size:calc(11.5px - 1px);}
.english-copy .lv-detail-explain-text {font-size:calc(11px - 1px);}
.english-copy .lv-detail-source {font-size:calc(9.5px - 1px);}
.english-copy .lv-source-note {font-size:calc(9.5px - 1px);}
</style>
