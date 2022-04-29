// const { process } = require("global");

const { process } = require('global')

/**
 * @description: 根据vant组件名，生成相应的映射地址
 * @param {*} componentName：组件名
 * @return {*} 组件映射地址
 */
const createVantPatterns = componentName => {
  const fileTypes = ['wxml', 'wxs', 'wxss']
  return fileTypes.map(item => {
    return {
      from: `src/components/vant-weapp/dist/${componentName}/index.${item}`,
      to: `dist/components/vant-weapp/dist/${componentName}/index.${item}`,
    }
  })
}

const resolve = dir => {
  const path = require('path')
  return path.resolve(__dirname, '..', dir)
}

const config = {
  projectName: 'taro-template-vue3',
  date: '2022-3-10',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['taro-plugin-pinia'],
  defineConstants: {
    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['taro-plugin-pinia'],
  alias: {
    '@': resolve('src'),
  },
  copy: {
    patterns: [
      /**此处为公共组件，必需--start */
      {
        from: 'src/components/vant-weapp/dist/wxs',
        to: 'dist/components/vant-weapp/dist/wxs',
      },
      {
        from: 'src/components/vant-weapp/dist/common/style',
        to: 'dist/components/vant-weapp/dist/common/style',
      },
      {
        from: 'src/components/vant-weapp/dist/common/index.wxss',
        to: 'dist/components/vant-weapp/dist/common/index.wxss',
      },
      /**此处为公共组件，必需--end */
      /**此处为按需组件，可选--start */
      ...createVantPatterns('icon'),
      ...createVantPatterns('button'),
      ...createVantPatterns('loading'),
      ...createVantPatterns('search'),
      ...createVantPatterns('cell'),
      ...createVantPatterns('field'),
      ...createVantPatterns('picker'),
      ...createVantPatterns('picker-column'),
      ...createVantPatterns('transition'),
      ...createVantPatterns('popup'),
      /**此处为按需组件，可选--end */
      // 部分组件可能会涉及到不止一个组件依赖，需要对应的全部引入。
      // （比如想要带有图标和加载动画的Button，除引入button之外，还需引入icon和loading才行。)
    ],
    options: {},
  },
  framework: 'vue3',
  mini: {
    output: {
      publicPath: '',
    },
    webpackChain: (chain, webpack) => {
      chain.merge({
        plugin: {
          install: {
            plugin: require('terser-webpack-plugin'),
            args: [
              {
                terserOptions: {
                  compress: true, // 默认使用terser压缩
                  // mangle: false,
                  keep_classnames: true, // 不改变class名称
                  keep_fnames: true, // 不改变函数名称
                },
              },
            ],
          },
        },
      })
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          selectorBlackList: [/van-/],
        },
      },
      url: {
        enable: true,
        config: {
          limit: 1024, // 设定转换尺寸上限
        },
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {},
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
