import { defineConfig } from 'vitepress'
import { sharedConfig } from './shared'
import { zhConfig } from './zh.ts'

export default defineConfig({
    ...sharedConfig,

    locales: {
        root: { label: '简体中文', lang: 'zh-CN', ...zhConfig }
    },
})