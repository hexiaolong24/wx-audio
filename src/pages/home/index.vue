<template>
  <view class="content-audio">
    <WXAudio
      @onPlay="play"
      @onEnded="end"
      @onPause="pause"
      @onStop="stop"
      audioKey="111"
      audioUrl="http://ws.stream.qqmusic.qq.com/C400002uUZvw1WzprD.m4a?guid=358840384&vkey=A8AF1B44403010408585E0337F0A5A454E912F2DCAE5797503D52BFC7D02FFED7CB104AE320D6D95A51A775BEBFC4A247755DF57D5C699EB&uin=&fromtag=120002"
    ></WXAudio>
  </view>
  <view class="content-audio">
    <WXAudio
      @onPlay="play"
      @onEnded="end"
      @onPause="pause"
      @onStop="stop"
      audioKey="222"
      audioUrl="https://qnyb00.cdn.ipalfish.com/0/img/06/fb/45dc2572e19ae254b4a0589bb623"
      type="normal"
    ></WXAudio>
  </view>
  <view class="content-audio">
    <WXAudio
      @onPlay="play"
      @onEnded="end"
      @onPause="pause"
      @onStop="stop"
      audioKey="333"
      audioUrl="http://ws.stream.qqmusic.qq.com/C400003WyBI54JqCz7.m4a?guid=358840384&vkey=CB56B181EFE8584A2B9B94A46680E1555F309AD13EE53E97BDCBF4F9E70B00D9A2084C96CBE907D4933D6415DA4B88CD856CFB6E70F7A7C0&uin=&fromtag=120002"
      type="normal"
    ></WXAudio>
  </view>
</template>

<script setup lang="ts">
import WXAudio from '@/components/wx-audio/index.vue'

const play = res => {
  console.log('play===', res)
}
const end = res => {
  console.log('end===', res)
}
const pause = res => {
  console.log('pause===', res)
}
const stop = res => {
  console.log('stop===', res)
}
</script>

<style lang="less">
.content-audio {
  width: 590rpx;
  height: 74rpx;
  margin-top: 100px;
  margin-bottom: 30px;
}
</style>
