import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const META_URL = 'https://pinia.vuejs.org'
export const META_TITLE = '游乐场 🍍'
export const META_DESCRIPTION = '值得你喜欢的 Vue Store'
// TODO: translation of this
// 'Intuitive, type safe, light and flexible Store for Vue'

export const zhConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
    description: META_DESCRIPTION,
    head: [
        ['meta', { property: 'og:url', content: META_URL }],
        ['meta', { property: 'og:description', content: META_DESCRIPTION }],
        ['meta', { property: 'twitter:url', content: META_URL }],
        ['meta', { property: 'twitter:title', content: META_TITLE }],
        ['meta', { property: 'twitter:description', content: META_DESCRIPTION }],
    ],

    themeConfig: {
        editLink: {
            pattern: 'https://github.com/weeseek/playground-blog/tree/main/docs/:path',
            text: '对本页提出修改建议',
        },

        outline: {
            label: '本页内容',
        },

        docFooter: {
            prev: '上一页',
            next: '下一页',
        },

        nav: [
            {
                text: '前端领域',
                items: [
                    {
                        text: '前端工程化',
                        link: '/engineering/',
                    },
                    {
                        text: '计算机网络',
                        link: '/network/',
                    },
                    {
                        text: '浏览器原理',
                        link: '/browser/',
                    },
                    {
                        text: '微应用',
                        link: '/algorithm/',
                    },
                ]
            },
            {
                text: '前端技术栈',
                items: [
                    {
                        text: 'Vue',
                        link: '/tech-stack/vue/',
                    },
                    {
                        text: 'Webpack',
                        link: '/tech-stack/webpack/',
                    },
                ]
            },
            {
                text: '前端项目',
                items: [
                    {
                        text: '自研监控系统',
                        link: '/project/monitor/',
                    },
                    {
                        text: '自研脚手架',
                        link: '/project/cli/',
                    },
                    {
                        text: '自研组件库',
                        link: '/project/component/',
                    },
                ]
            },
            {
                text: '前端面试',
                items: [
                    {
                        text: 'Vue 面试题',
                        link: '/vue-interview/',
                    },
                    {
                        text: 'JavaScript 面试题',
                        link: '/js-interview/',
                    },
                ]
            },
            {
                text: '书籍',
                items: [
                ]
            }
        ],
        sidebar: {
            "/webpack/": [
                {
                    text: "介绍",
                    items: [
                        {
                            text: "基础",
                            link: "/webpack/",
                        },
                    ],
                },
                {
                    text: "核心概念",
                    items: [
                        {
                            text: "Plugin",
                            link: "/webpack/plugin",
                        },
                        {
                            text: "Loader",
                            link: "/webpack/loader",
                        },
                    ],
                },

                {
                    text: "简易版实现",
                    items: [
                        {
                            text: "Webpack",
                            link: "/webpack/mini-webpack",
                        },
                        {
                            text: "Plugin",
                            link: "/webpack/mini-plugin",
                        },
                        {
                            text: "Loader",
                            link: "/webpack/mini-loader",
                        }
                    ],
                },
            ]
        },
    },
}

export const zhSearch: DefaultTheme.AlgoliaSearchOptions['locales'] = {
    zh: {
        placeholder: '搜索文档',
        translations: {
            button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
            },
            modal: {
                searchBox: {
                    resetButtonTitle: '清除查询条件',
                    resetButtonAriaLabel: '清除查询条件',
                    cancelButtonText: '取消',
                    cancelButtonAriaLabel: '取消',
                },
                startScreen: {
                    recentSearchesTitle: '搜索历史',
                    noRecentSearchesText: '没有搜索历史',
                    saveRecentSearchButtonTitle: '保存至搜索历史',
                    removeRecentSearchButtonTitle: '从搜索历史中移除',
                    favoriteSearchesTitle: '收藏',
                    removeFavoriteSearchButtonTitle: '从收藏中移除',
                },
                errorScreen: {
                    titleText: '无法获取结果',
                    helpText: '你可能需要检查你的网络连接',
                },
                footer: {
                    selectText: '选择',
                    navigateText: '切换',
                    closeText: '关闭',
                    searchByText: '搜索供应商',
                },
                noResultsScreen: {
                    noResultsText: '无法找到相关结果',
                    suggestedQueryText: '你可以尝试查询',
                    reportMissingResultsText: '你认为该查询应该有结果？',
                    reportMissingResultsLinkText: '点击反馈',
                },
            },
        },
    },
}