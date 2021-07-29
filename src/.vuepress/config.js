module.exports = {
  title: '八雲技術帳',
  description: '',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', type: 'image/png' }],
  ],
  markdown: {
    lineNumbers: true
  },
  theme: 'blog-vuetify',
  // https://github.com/ttskch/vuepress-theme-blog-vuetify/blob/master/index.js#L14
  themeConfig: {
    globalPagination: {
      lengthPerPage: 20,
    },
    titleIcon: 'feather',
    //titleIcon: 'pencil-box-outline',
    
    sidebar: {
      hotTags: 10,
      recentPosts: 0,
      profile: {
        avatarUrl: 'https://avatars.githubusercontent.com/u/1060869?v=4',
        name: 'Yakumo Saki',
        subTitle: 'Programmer',
        // HTML OK
        descriptionHtml: 'Developer / Homelab engineer in Tokyo',
      },
      additionalBlocks: [
        // {
        //   title: 'Pages',
        //   links: [
        //     { label: 'PROFILE', path: '/profile' },
        //   ],
        // },
      ],
    },
    footer: {
      links: [
        { label: 'PROFILE', path: '/profile' },
      ],
    },
    sns: {
      twitter: 'https://twitter.com/maoh_nol',
      github: 'https://github.com/yakumo-saki',
      feed: '',
    },
    seo: {
      baseUrl: 'https://blog.nerves-concord.io/',
      author: '',
      image: 'https://avatars.githubusercontent.com/u/1060869?v=4',
      fbAppId: '',
      twitterSite: '@maoh_nol',
      twitterCreator: '@maoh_nol',
      articleDirectoryNames: [
        '_posts',
        '_pages',
      ],
    },
    ga: 'G-B7EJTQN1QR',
    summary: 300,
    dateFormat: 'YYYY/MM/DD',
    components: {
      afterFooter: 'MyAfterFooter',
    },
  },
  plugins: ['redirect-frontmatter'],
}
