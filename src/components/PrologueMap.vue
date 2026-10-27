<template>
  <section class="prologue-wrap chapter" :id="id" :class="{ 'english-copy': language === 'en' }" :lang="language === 'en' ? 'en' : 'zh-CN'">
    <!-- 背景层（视差） -->
    <div class="bg-layer bg-layer-1" ref="bg1Ref"></div>
    <div class="bg-layer bg-layer-2" ref="bg2Ref"></div>

    <!-- 内容层 -->
    <div class="prologue-inner" ref="contentRef">
      <!-- 大标题 -->
      <header class="prologue-header" ref="headerRef">
        <div class="prologue-kicker" ref="kickerRef">{{ t('序 · 言') }}</div>
        <h1 class="prologue-title" ref="titleRef">
          <span v-for="(ch, i) in titleChars" :key="'t'+i" class="title-ch" :ref="el => titleCharRefs[i] = el">{{ ch }}</span>
        </h1>
        <div class="prologue-divider" ref="dividerRef">
          <span class="divider-line left"></span>
          <span class="divider-leaf">{{ t('茶') }}</span>
          <span class="divider-line right"></span>
        </div>
      </header>

      <!-- 正文段落（逐段浮现） -->
      <div class="prologue-body" ref="bodyRef">
        <p v-for="(p, i) in paragraphs" :key="'p'+i" class="prologue-para" :ref="el => paraRefs[i] = el" :style="{ '--shift': i * 6 + 'px' }">
          <span class="para-mark" v-if="i === 0">「</span>
          {{ p }}
          <span class="para-mark end" v-if="i === 0">」</span>
        </p>
      </div>

      <!-- 进入提示 -->
      <div class="prologue-hint" ref="hintRef">
        <span class="hint-text">{{ t('点击按钮 · 开启图志') }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '../utils/language.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
const { language, t } = useLanguage()

defineProps({ id: { type: String, required: true } })

const router = useRouter()

const titleChars = computed(() => language.value === 'en'
  ? t('山海一叶').split(' ').map(word => word + ' ')
  : Array.from('山海一叶'))
const titleCharRefs = []

const sourceParagraphs = [
  '茶，是一片叶子的故事，也是大地与时间共同书写的历史。',
  '一叶嫩芽，自华夏山野破土而生，跨越千年光阴，串联起山川风物、市井烟火与万里往来。这座以地图为载体的茶史可视化站点，循着茶叶的生命脉络铺展叙事，从原生山野到世界餐桌，还原中国茶文化的生长与远行之路。',
  '开篇落笔于茶树扎根的广袤山水，探寻适配茶芽生长的水土气候密码。深入云雾缭绕的名山茶园，细数传统名茶沉淀的风味底蕴。再跟随古道车马与江河舟楫，见证一叶茶走出深山、流通四方的漫长旅途。视线拉至当下，可观现代茶园规模化建设、茶叶出口稳步拓展的产业新貌。放眼海外，便能看见茶香跨越国界，在不同国度落地生根，衍生出风格各异的饮茶习俗。',
  '我们摒弃厚重晦涩的史料堆砌，以交互式地图串联地理点位与人文故事，用舒缓雅致的视觉叙事拆解茶文化的多重维度。不必翻遍典籍，滑动页面即可走遍古今茶区，触摸藏在云雾里的制茶匠心，读懂茶叶从本土风物走向全球饮品的完整历程。愿每一位浏览者都能循着茶香，看见山水育茶的自然馈赠，感受千年传承的文化温度。',
]
const paragraphs = computed(() => sourceParagraphs.map(t))
const paraRefs = []

const bg1Ref = ref(null)
const bg2Ref = ref(null)
const contentRef = ref(null)
const headerRef = ref(null)
const kickerRef = ref(null)
const titleRef = ref(null)
const dividerRef = ref(null)
const bodyRef = ref(null)
const hintRef = ref(null)

let scrollTrigger = null
let scrollListener = null

function goNext() {
  router.push('/ch1')
}

onMounted(async () => {
  await nextTick()

  // 初始隐藏
  gsap.set(kickerRef.value, { opacity: 0, y: 20, scale: 0.9 })
  gsap.set(titleCharRefs, { opacity: 0, y: 60, rotateX: -80 })
  gsap.set(dividerRef.value, { opacity: 0, scaleX: 0 })
  gsap.set(paraRefs, { opacity: 0, y: 50 })
  gsap.set(hintRef.value, { opacity: 0, y: 30 })
  gsap.set(bg1Ref.value, { yPercent: -10, scale: 1.05 })
  gsap.set(bg2Ref.value, { yPercent: -5 })

  // 进入动画：header → 段落 → hint 按时间自动依次播放
  const tl = gsap.timeline()

  tl.to(kickerRef.value, {
    opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out'
  })
  tl.to(titleCharRefs, {
    opacity: 1, y: 0, rotateX: 0, duration: 0.7,
    stagger: Math.min(0.12, 0.36 / Math.max(1, titleChars.value.length - 1)), ease: 'back.out(1.4)'
  }, '-=0.3')
  tl.to(dividerRef.value, {
    opacity: 1, scaleX: 1, duration: 0.8, ease: 'power3.out'
  }, '-=0.2')

  // 逐段舒缓浮现：每段持续 2.5 秒，相邻段落重叠 0.5 秒。
  paraRefs.forEach((p, i) => {
    tl.to(p, {
      opacity: 1,
      y: 0,
      duration: 2.5,
      ease: 'power2.out'
    }, `-=${0.5}`)
  })

  tl.to(hintRef.value, {
    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out'
  }, '-=0.3')

  // 视差：鼠标移动时的微妙视差
  scrollListener = (e) => {
    if (!contentRef.value) return
    const rect = contentRef.value.getBoundingClientRect()
    const cx = e.clientX - (rect.left + rect.width / 2)
    const cy = e.clientY - (rect.top + rect.height / 2)
    const tx = (cx / rect.width) * 14
    const ty = (cy / rect.height) * 14
    gsap.to(bg2Ref.value, { x: tx * 0.4, y: ty * 0.4, duration: 1.2, ease: 'power2.out' })
    gsap.to(bg1Ref.value, { x: tx * 0.7, y: ty * 0.7, duration: 1.5, ease: 'power2.out' })
  }
  window.addEventListener('mousemove', scrollListener)

  // 滚动视差：向下滚动时内容逐步浮起并离场（保持基础视觉层次）
  const max = document.documentElement.scrollHeight - document.documentElement.clientHeight
  if (max > 10) {
    scrollTrigger = ScrollTrigger.create({
      trigger: contentRef.value,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress
        gsap.set(headerRef.value, { y: -p * 80, opacity: Math.max(0.3, 1 - p * 1.1) })
        gsap.set(bodyRef.value, { y: -p * 120 })
        gsap.set(hintRef.value, { y: -p * 160, opacity: Math.max(0, 1 - p * 2) })
        gsap.set(bg1Ref.value, { yPercent: -10 - p * 20, scale: 1.05 + p * 0.08 })
        gsap.set(bg2Ref.value, { yPercent: -5 - p * 12 })
      }
    })
  }

})

onBeforeUnmount(() => {
  if (scrollListener) window.removeEventListener('mousemove', scrollListener)
  if (scrollTrigger) scrollTrigger.kill()
  ScrollTrigger.getAll().forEach(t => t.kill())
})
</script>

<style scoped>
.prologue-wrap {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: var(--c-paper-2, #F7F4EB);
  color: var(--ink, #2a2a24);
}

/* ============ 背景层（视差） ============ */
.bg-layer {
  position: absolute;
  inset: -10% -5% -10% -5%;
  pointer-events: none;
  will-change: transform;
}
.bg-layer-1 {
  /* 远山：暖色柔渐变 + 装饰纹路 */
  background:
    radial-gradient(ellipse 70% 50% at 30% 80%, rgba(178, 143, 76, 0.18), transparent 70%),
    radial-gradient(ellipse 55% 45% at 75% 25%, rgba(92, 124, 58, 0.18), transparent 70%),
    radial-gradient(ellipse 80% 60% at 50% 100%, rgba(195, 193, 154, 0.35), transparent 70%),
    linear-gradient(180deg, #F9F5E8 0%, #EFE9DA 50%, #E3DBBF 100%);
  filter: saturate(0.9);
}
.bg-layer-2 {
  /* 云雾层：多个柔和圆形叠加，跟随视差漂移 */
  background:
    radial-gradient(circle at 15% 40%, rgba(255, 252, 242, 0.7), transparent 38%),
    radial-gradient(circle at 80% 60%, rgba(255, 252, 242, 0.6), transparent 35%),
    radial-gradient(circle at 45% 85%, rgba(250, 247, 239, 0.5), transparent 40%);
  mix-blend-mode: screen;
  opacity: 0.85;
}

/* ============ 内容层 ============ */
.prologue-inner {
  position: relative;
  z-index: 2;
  max-width: 860px;
  margin: 0 auto;
  padding: 6vh 32px 12vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Header */
.prologue-header {
  text-align: center;
  margin-top: 4vh;
  margin-bottom: 56px;
  perspective: 800px;
}
.prologue-kicker {
  font-family: var(--font-qiji, var(--serif));
  font-size: clamp(0.95rem, 1.4vw, 1.1rem);
  letter-spacing: 0.8em;
  padding-left: 0.8em;
  color: var(--c-gold-deep, #8E6F38);
  margin-bottom: 24px;
  font-weight: 500;
}
.prologue-title {
  font-family: var(--font-kesong, var(--serif));
  font-weight: 700;
  font-size: clamp(3.2rem, 9vw, 6.2rem);
  line-height: 1.1;
  color: var(--c-olive-dark, #3D5428);
  letter-spacing: 0.18em;
  padding-left: 0.18em;
  margin: 0 0 30px;
  display: inline-flex;
  justify-content: center;
  gap: 0.02em;
  transform-style: preserve-3d;
}
.title-ch {
  display: inline-block;
  transform-origin: 50% 100%;
  text-shadow: 0 2px 12px rgba(61, 84, 40, 0.12);
}

.prologue-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  transform-origin: 50% 50%;
}
.divider-line {
  display: inline-block;
  width: clamp(80px, 18vw, 180px);
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--c-gold, #B28F4C), transparent);
}
.divider-line.left { background: linear-gradient(90deg, transparent, var(--c-gold, #B28F4C)); }
.divider-line.right { background: linear-gradient(90deg, var(--c-gold, #B28F4C), transparent); }
.divider-leaf {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--c-olive, #516D33);
  color: var(--c-paper, #EFE9DA);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-qiji, var(--serif));
  font-size: 14px;
  box-shadow: 0 2px 12px rgba(81, 109, 51, 0.25);
}

/* Body 正文 */
.prologue-body {
  width: 100%;
  max-width: 760px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-bottom: 70px;
}
.prologue-para {
  font-family: var(--font-dzji, var(--serif));
  font-size: clamp(0.98rem, 1.3vw, 1.12rem);
  line-height: 2.1;
  color: var(--ink, #2a2a24);
  margin: 0;
  text-indent: 2em;
  letter-spacing: 0.04em;
  position: relative;
}
.prologue-para:first-child {
  font-size: clamp(1.15rem, 1.6vw, 1.35rem);
  color: var(--c-olive, #516D33);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-indent: 0;
  text-align: center;
  padding: 10px 0;
  border-top: 1px solid rgba(178, 143, 76, 0.3);
  border-bottom: 1px solid rgba(178, 143, 76, 0.3);
}
.para-mark {
  font-family: var(--font-kesong, var(--serif));
  font-size: 1.8em;
  color: var(--c-gold, #B28F4C);
  vertical-align: baseline;
  margin: 0 0.1em 0 -0.4em;
  line-height: 0;
}
.para-mark.end {
  margin: 0 -0.2em 0 0.1em;
}

/* Hint */
.prologue-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding-top: 20px;
}
.hint-text {
  font-family: var(--font-qiji, var(--serif));
  font-size: 0.88rem;
  letter-spacing: 0.3em;
  padding-left: 0.3em;
  color: var(--c-beige-dark, #A5A37A);
}
.hint-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 28px;
  border-radius: 40px;
  background: var(--c-olive, #516D33);
  color: var(--c-paper, #EFE9DA);
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 20px -4px rgba(61, 84, 40, 0.4);
  transition: all 0.3s ease;
}
.hint-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px -6px rgba(61, 84, 40, 0.5);
  background: var(--c-olive-mid, #5C7C3A);
}
.btn-label {
  font-family: var(--font-qiji, var(--serif));
  letter-spacing: 0.15em;
  padding-left: 0.15em;
  font-size: 0.95rem;
}
.btn-arrow {
  font-family: var(--font-dzji, var(--serif));
  font-weight: 700;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .prologue-inner { padding: 4vh 20px 10vh; }
  .prologue-kicker { letter-spacing: 0.5em; }
  .prologue-title { letter-spacing: 0.1em; }
  .prologue-para { line-height: 1.9; }
}
</style>
