const { description } = require('../../package')

module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: '八雲技術帳',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: description,

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],

  theme: 'modern-blog',
  themeConfig: {

  },
  //theme: 'blog-vuetify',
  //theme: 'vuepress-theme-maker',
  //theme: 'vuepress-theme-indigo-material',

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  // themeConfig: {
  //   repo: '',
  //   editLinks: false,
  //   docsDir: '',
  //   editLinkText: '',
  //   lastUpdated: false,
  //   nav: [
  //     {
  //       text: 'Guide',
  //       link: '/guide/',
  //     },
  //     {
  //       text: 'Config',
  //       link: '/config/'
  //     },
  //     {
  //       text: 'VuePress',
  //       link: 'https://v1.vuepress.vuejs.org'
  //     }
  //   ],
  //   sidebar: {
  //     '/guide/': [
  //       {
  //         title: 'Guide',
  //         collapsable: false,
  //         children: [
  //           '',
  //           'using-vue',
  //         ]
  //       }
  //     ],
  //   }
  // },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */

  plugins: [
    '@vuepress/blog',
    'vuepress-plugin-table-of-contents'
  ]
}
