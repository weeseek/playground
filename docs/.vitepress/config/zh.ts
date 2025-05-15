import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const META_URL = 'https://pinia.vuejs.org'
export const META_TITLE = '游乐场 🍍'
export const META_DESCRIPTION = '值得你喜欢的 Vue Store'
// TODO: translation of this
// 'Intuitive, type safe, light and flexible Store for Vue'

// 项目实战
const practices = [
    {
        text: "企业级前端工程化方案",
        link: "/practice/enterprise",
    },
    {
        text: "企业级监控系统",
        link: "/practice/monitor",
    },
    {
        text: "定制化脚手架开发",
        link: "/practice/cli",
    },
    {
        text: "企业级组件库",
        link: "/practice/component",
    },
    {
        text: "CI/CD流水线搭建",
        link: "/practice/cicd",
    }
]

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
                items: practices
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
            "/engineering/": [
                {
                    text: "大纲",
                    link: "/engineering/",
                },
                {
                    text: "概述",
                    link: "/engineering/overview",
                },
                {
                    text: "模块化",
                    link: "/engineering/module",
                },
                {
                    text: "包管理与依赖管理",
                    link: "/engineering/packmanage",
                },
                {
                    text: "构建工具",
                    link: "/engineering/build",
                },
                {
                    text: "代码规范与质量保障",
                    link: "/engineering/eslint",
                },
                {
                    text: "自动化测试",
                    link: "/engineering/autotesting",
                },
                {
                    text: "持续集成与部署",
                    link: "/engineering/cicd",
                },
                {
                    text: "性能优化",
                    link: "/engineering/performance",
                },
                {
                    text: "微前端",
                    link: "/engineering/microfrontend",
                },
                {
                    text: "工程化进阶",
                    link: "/engineering/advanced",
                },
                {
                    text: "未来趋势",
                    link: "/engineering/future",
                }, {
                    text: "实战项目",
                    items: practices
                }
            ],
            "practice": practices,
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