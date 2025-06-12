import type { DefaultTheme } from 'vitepress'
import fs from 'fs'
import path from 'path'

const books: DefaultTheme.NavItemWithLink[] = []

const booksPath = path.resolve(__dirname, '../../public/books/')
fs.readdirSync(booksPath).forEach((file) => {
    if (file.endsWith('.pdf')) {
        const name = file.replace('.pdf', '')
        books.push({
            text: name,
            link: `./books/${encodeURIComponent(name)}.pdf`,
            target: '_blank',
            rel: 'noopener noreferrer',
        })
    }
})

export default books