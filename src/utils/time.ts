interface GetMinutesAndSeconds {
  (seconds: number, type?: number): string
}
export const getMinutesAndSeconds: GetMinutesAndSeconds = (time: number, type: number = 0) => {
  // 时长小于1s 默认返回Infinity
  if (time === Infinity || (time < 1 && time !== 0)) {
    time = 1
  }
  const minutes: number = Math.floor(time / 60)
  const seconds: number = Math.floor(time % 60)
  let secondsText: string = (seconds + '').padStart(2, '0')
  if (type === 0) {
    let minutesText: string = (minutes + '').padStart(2, '0')
    return `${minutesText}:${secondsText}`
  } else if (type === 1) {
    let minutesText: string = minutes + ''
    return `${minutesText}’${secondsText}"`
  } else {
    return ''
  }
}
