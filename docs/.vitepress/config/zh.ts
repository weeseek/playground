import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'
import books from './books'

export const META_URL = 'https://pinia.vuejs.org'
export const META_TITLE = '游乐场 🍍'
export const META_DESCRIPTION = '值得你喜欢的 前端知识、实战项目以及前沿领域。'

// 项目实战
const practices = [
    {
        text: "企业级微前端架构",
        link: "/practice/microfrontend",
    },
    {
        text: "企业级组件库建设",
        link: "/practice/component",
    },
    {
        text: "企业级前端监控系统",
        link: "/practice/monitor",
    },
    {
        text: "定制化脚手架开发",
        link: "/practice/cli",
    },
    {
        text: "CI/CD流水线搭建",
        link: "/practice/cicd",
    },
    {
        text: "DevOps",
        link: "/practice/devops",
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
                ]
            },
            {
                text: '工程化实践',
                items: practices
            },
            {
                text: 'AI',
                items: [
                    {
                        text: '学习路线',
                        link: '/ai/index',
                    },
                    {
                        text: 'Python',
                        link: '/ai/python',
                    },
                    {
                        text: '数学',
                        link: '/ai/math',
                    },
                    {
                        text: '数据分析',
                        link: '/ai/data',
                    },
                    {
                        text: '数据结构与算法',
                        link: '/ai/algorithm',
                    },
                    {
                        text: '机器学习',
                        link: '/ai/machine',
                    },
                    {
                        text: '深度学习',
                        link: '/ai/deeplearning',
                    }
                ]
            },
            {
                text: '手撕代码篇',
                items: [
                    {
                        text: 'JavaScript',
                        link: '/coding/js',
                    },
                    {
                        text: 'Promise',
                        link: '/coding/promise',
                    },
                    {
                        text: 'Vue',
                        link: '/coding/vue',
                    },
                    {
                        text: 'Webpack',
                        link: '/coding/webpack',
                    },
                ]
            },
            {
                text: '书籍',
                items: books
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
            "/network/": [
                {
                    text: "大纲",
                    link: "/network/",
                },
                {
                    text: "计算机网络概述",
                    link: "/network/overview",
                },
                {
                    text: "HTTP协议深度解析",
                    link: "/network/http",
                },
                {
                    text: "HTTPS与安全",
                    link: "/network/https",
                },
                {
                    text: "浏览器网络机制",
                    link: "/network/browser",
                },
                {
                    text: "WebSocket与实时通信",
                    link: "/network/websocket",
                },
                {
                    text: "性能优化相关网络知识",
                    link: "/network/performance",
                },
                {
                    text: "前端调试与网络分析",
                    link: "/network/debug",
                },
                {
                    text: "现代Web应用网络特性",
                    link: "/network/modern",
                },
            ],
            "/browser/": [
                {
                    text: "大纲",
                    link: "/browser/",
                },
                {
                    text: "浏览器基础架构",
                    link: "/browser/architecture",
                },
                {
                    text: "网页渲染流程",
                    link: "/browser/rendering",
                },
                {
                    text: "JavaScript引擎与事件循环",
                    link: "/browser/js-engine",
                },
                {
                    text: "浏览器存储与缓存机制",
                    link: "/browser/storage",
                },
                {
                    text: "浏览器安全机制",
                    link: "/browser/security",
                },
                {
                    text: "现代浏览器高级特性",
                    link: "/browser/advanced",
                },
                {
                    text: "调试与性能分析",
                    link: "/browser/debug",
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