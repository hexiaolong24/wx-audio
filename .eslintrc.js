// ESLint 检查 .vue 文件需要单独配置编辑器：
// https://eslint.vuejs.org/user-guide/#editor-integrations
module.exports = {
  extends: ['taro/vue3'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaFeatures: {
      jsx: true,
    },
    useJSXTextNode: true,
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        semi: false, // 使用分号 默认true
        singleQuote: true, // 使用单引号 默认false jsx中无效
        tabWidth: 2, // tab缩进大小,默认为2
        useTabs: false, // 使用tab缩进，默认false
        jsxSingleQuote: true, // jsx中使用单引号
        bracketSpacing: true, // 大括号是否强制空格
        jsxBracketSameLine: false, // 多行js结束标签是否与属性同行
        printWidth: 100, // 单行长度
        arrowParens: 'avoid', // 必要的时候省略箭头函数参数的括号包裹(单个参数时省略)
      },
    ],
  },
}
