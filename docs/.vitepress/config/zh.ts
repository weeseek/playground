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
            pattern: 'https://github.com/vuejs/pinia/edit/v3/packages/docs/:path',
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
            // { text: 'Config', link: '/config/' },
            // { text: 'Plugins', link: '/plugins/' },
            {
                text: '指南',
                link: '/zh/core-concepts/',
                activeMatch: '^/zh/core-concepts/',
            },
            { text: 'API', link: '/zh/api/', activeMatch: '^/zh/api/' },
            { text: '手册', link: '/zh/cookbook/', activeMatch: '^/zh/cookbook/' },
            {
                text: '相关链接',
                items: [
                    {
                        text: '论坛',
                        link: 'https://github.com/vuejs/pinia/discussions',
                    },
                    {
                        text: '更新日志',
                        link: 'https://github.com/vuejs/pinia/blob/v3/packages/pinia/CHANGELOG.md',
                    },
                ],
            },
        ],
        sidebar: {
            '/zh/': [
                {
                    text: '介绍',
                    items: [
                        {
                            text: 'Pinia 是什么？',
                            link: '/zh/introduction.html',
                        },
                        {
                            text: '开始',
                            link: '/zh/getting-started.html',
                        },
                    ],
                },
            ],
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