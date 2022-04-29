<template>
  <view class="hl-audio">
    <!-- 带进度条 -->
    <view class="hl-audio-hasprogress" v-if="type === 'progress'">
      <image
        v-if="!aduioData.isPlay"
        class="audio-icon"
        src="@/assets/hl-audio/audio-play.png"
        @tap="handleToggle"
      />
      <image
        v-else
        class="audio-icon"
        src="@/assets/hl-audio/audio-pause.png"
        @tap="handleToggle"
      />
      <text :class="['audio-currenttime', aduioData.moveFlag ? 'audio-movecurrenttime' : '']">{{
        aduioData.moveFlag ? aduioData.moveCurrentText : progressCurrentText
      }}</text>
      <view class="audio-progress-wrap">
        <view
          :class="['audio-progress-inner', aduioData.moveFlag ? 'audio-progress-inner-move' : '']"
          :style="{
            width: aduioData.moveFlag ? aduioData.innerWidth : progressInnerWidth,
          }"
        >
          <view
            class="audio-progress-point"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
          >
          </view>
        </view>
      </view>
      <text class="audio-currenttime">{{ aduioData.durationText }}</text>
    </view>
    <!-- 不带进度条 -->
    <view class="hl-audio-noprogress" v-if="type === 'normal'" @tap="handleToggle">
      <text class="noprogress-backtext">{{ aduioData.backCurrentText }}</text>
      <image v-if="!aduioData.isPlay" class="noprogress-icon" src="@/assets/play.png" />
      <image v-else class="noprogress-icon" src="@/assets/hl-audio/playing.gif" />
    </view>
    <!-- 背景色 -->
    <!-- 如果父元素添加了opacity，子元素会继承，即使子元素设置opacity: 1，也是在父元素opacity的基础之上 -->
    <!-- 解决方案： 使用兄弟元素重贴定位设置背景色 -->
    <view class="hl-audio-background" />
  </view>
</template>
<script setup lang="ts">
import { onMounted, reactive, computed, ref, onUnmounted, toRaw } from 'vue'
import { getMinutesAndSeconds } from '@/utils/time'
import { useAudioList } from '@/store/audioList'
import Taro from '@tarojs/taro'
const audioListStore = useAudioList()
const props = defineProps({
  // audio类型
  type: {
    type: String,
    default: 'progress',
  },
  // audiourl
  audioUrl: {
    type: String,
    default: '',
  },
  // audiokey
  audioKey: {
    type: String,
    default: '',
  },
})
// audio实例
let innerAudioContext
// 时长 当前时间
const aduioData = reactive({
  duration: 0, // 总时长
  currentTime: 0, // 当前播放时间
  backCurrentText: '', // 倒计时时间展示
  durationText: '', // 总时间展示
  moveCurrentText: '', // 拖动时时间展示
  isPlay: false, // 是否正在播放
  innerWidth: '', // 进度条宽度
  moveFlag: false, // 是否正在拖动
})
// 进度条容器left
const domWrapLeft = ref()
// 进度条容器left
const domWrapRight = ref()
// 进度条容器width
const domWrapWidth = ref()
// 分发事件
const emits = defineEmits(['onPlay', 'onPause', 'onEnded', 'onStop'])

// 监听可以播放
const _onCanplay = () => {
  // 获取时长
  aduioData.duration = innerAudioContext.duration
  // 第一次获取到的是0，必须在setTimeout里再次获取
  // 如果时长是小于1s，第一次播放前会返回Infinity,第二次正常，需特殊处理
  setTimeout(() => {
    if (!aduioData.duration) {
      _onCanplay()
    }
  }, 100)
  if (!aduioData.duration) {
    return
  } else {
    aduioData.durationText = getMinutesAndSeconds(aduioData.duration)
    aduioData.backCurrentText = getMinutesAndSeconds(aduioData.duration, 1)
  }
}
// 初始化实例
const audioInit = () => {
  innerAudioContext = wx.createInnerAudioContext()
  innerAudioContext.type = props.type
  // 总队列保存audio实例
  audioListStore.pushAudio(props.audioKey, innerAudioContext)
  innerAudioContext.autoplay = false
  innerAudioContext.src = props.audioUrl
  innerAudioContext.onPlay(() => {
    emits('onPlay', {
      audioKey: props.audioKey,
      state: 'onPlay',
    })
  })
  // 监听可以播放
  innerAudioContext.onCanplay(_onCanplay)
  // 监听播放中
  innerAudioContext.onTimeUpdate(() => {
    aduioData.isPlay = true
    // 当前时间
    aduioData.currentTime = innerAudioContext.currentTime
    // type 1 倒计时
    aduioData.backCurrentText = getMinutesAndSeconds(aduioData.duration - aduioData.currentTime, 1)
  })
  // 监听暂停
  innerAudioContext.onPause(() => {
    aduioData.isPlay = false
  })
  // 自然播放完毕
  innerAudioContext.onEnded(() => {
    aduioData.isPlay = false
    aduioData.currentTime = 0
    aduioData.backCurrentText = getMinutesAndSeconds(aduioData.duration, 1)
    emits('onEnded', {
      audioKey: props.audioKey,
      state: 'onEnded',
    })
  })
  innerAudioContext.onStop(() => {
    aduioData.isPlay = false
    if (aduioData.duration) {
      aduioData.backCurrentText = getMinutesAndSeconds(aduioData.duration, 1)
    }
    emits('onStop', {
      audioKey: props.audioKey,
      state: 'onStop',
    })
  })
}
const getProgressWrapPosition = () => {
  // 获取进度条容器dom
  const query = Taro.createSelectorQuery()
  query
    .select('.audio-progress-wrap')
    .boundingClientRect(res => {
      domWrapLeft.value = res.left
      domWrapRight.value = res.right
      domWrapWidth.value = res.width
    })
    .exec()
}
// 监听拖动进度条
const handleTouchMove = e => {
  // 正在移动
  aduioData.moveFlag = true
  const moveLeft = e.changedTouches[0].clientX
  if (moveLeft <= domWrapLeft.value) {
    aduioData.innerWidth = '0'
    aduioData.moveCurrentText = '00:00'
  } else if (moveLeft >= domWrapRight.value) {
    aduioData.innerWidth = '100%'
    aduioData.moveCurrentText = aduioData.durationText
  } else {
    // 计算进度条宽度
    aduioData.innerWidth = ((moveLeft - domWrapLeft.value) / domWrapWidth.value) * 100 + '%'
    // 当前播放秒数
    const currentProgress =
      ((moveLeft - domWrapLeft.value) / domWrapWidth.value) * aduioData.duration
    // 更新当前时长
    aduioData.moveCurrentText = getMinutesAndSeconds(currentProgress)
  }
}
const handleTouchEnd = e => {
  // 移动停止
  aduioData.moveFlag = false
  const moveLeft = e.changedTouches[0].clientX
  if (moveLeft <= domWrapLeft.value) {
    aduioData.currentTime = 0
  } else if (moveLeft >= domWrapRight.value) {
    // 如果直接=aduioData.duration，拖动结束会直接到0的状态
    aduioData.currentTime = aduioData.duration - 0.00001
  } else {
    // 当前播放秒数
    const currentProgress =
      ((moveLeft - domWrapLeft.value) / domWrapWidth.value) * aduioData.duration
    // 更新当前时长（防止松开时从原来位置瞬时移动）
    // 显示时长和进度条宽度都与currentTime有关系
    aduioData.currentTime = currentProgress
  }
  // 跳到对应位置播放
  innerAudioContext.seek(aduioData.currentTime)
}
// 播放
const handleToggle = () => {
  // 判断当前是暂停或停止状态
  if (innerAudioContext.paused) {
    // 停止 -> 播放
    audioListStore.audioList.forEach((_innerAudioContext, _key) => {
      // 排除自己
      if (_key !== props.audioKey) {
        // 如果不是暂停状态才停止
        // pinia管理的数据会Proxy代理（响应式数据），获取getter属性会报错，需要toRaw生成普通对象，如果不是vue环境可以通过JSON.
        if (!toRaw(_innerAudioContext).paused) {
          if (_innerAudioContext.type === 'normal') {
            _innerAudioContext.stop()
          } else {
            _innerAudioContext.pause()
            emits('onPause', {
              audioKey: _key,
              state: 'onPause',
            })
          }
        }
      }
    })
    // 播放自己
    innerAudioContext.play()
  } else {
    // 因为播放的时候已经处理，只能有一条音频同时播放，所以只暂停自己就可以
    // 播放 -> 停止
    if (props.type === 'normal') {
      innerAudioContext.stop()
    } else {
      innerAudioContext.pause()
      emits('onPause', {
        audioKey: props.audioKey,
        state: 'onPause',
      })
    }
  }
}
// 计算属性进度条
const progressInnerWidth = computed(() => {
  return (aduioData.currentTime / aduioData.duration) * 100 + '%'
})
// 计算属性当前播放时间
const progressCurrentText = computed(() => {
  return getMinutesAndSeconds(aduioData.currentTime)
})
onMounted(() => {
  props.audioUrl && audioInit()
  // 不异步获取不到dom
  setTimeout(getProgressWrapPosition, 200)
})
onUnmounted(() => {
  innerAudioContext.destroy()
  audioListStore.deleteAudio(props.audioKey)
})
</script>

<style lang="less">
.hl-audio {
  width: 100%;
  height: 100%;
  position: relative;
  .hl-audio-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(270deg, #ff3000 0%, #ff8000 100%);
    opacity: 0.2;
    border-radius: 19rpx;
  }
  .hl-audio-hasprogress {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    .audio-icon {
      position: relative;
      z-index: 1;
      width: 9.49%;
      height: 75.6%;
    }
    .audio-currenttime {
      min-width: 68rpx;
      font-size: 24rpx;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #ff8000;
      line-height: 24rpx;
      opacity: 0.8;
    }
    .audio-movecurrenttime {
      transform: scale(1.2);
      opacity: 1;
    }
    .audio-progress-wrap {
      position: relative;
      width: 56.6%;
      height: 10%;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 3rpx;
      z-index: 1;

      .audio-progress-inner {
        height: 100%;
        background: linear-gradient(270deg, #ff3000 0%, #ff8000 100%);
        border-radius: 2px;
        position: relative;
        .audio-progress-point {
          width: 24rpx;
          height: 24rpx;
          background: #ff8000;
          border-radius: 50%;
          position: absolute;
          right: 0;
          top: 50%;
          transform: translate(50%, -50%);
        }
      }
      .audio-progress-inner-move {
        height: 100%;
      }
    }
  }
  .hl-audio-noprogress {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30rpx;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
    .noprogress-backtext {
      font-size: 24rpx;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #ff8000;
    }
    .noprogress-icon {
      width: 24rpx;
      height: 24rpx;
    }
  }
}
</style>
