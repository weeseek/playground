import { defineConfig } from 'vitepress'
import { sharedConfig } from './config/shared'
import { zhConfig } from './config/zh.ts'

export default defineConfig({
    ...sharedConfig,

    locales: {
        root: { label: '简体中文', lang: 'zh-CN', ...zhConfig }
    },
})