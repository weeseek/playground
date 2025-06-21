---
layout: home

sidebar: false
aside: false
editLink: false

title: 书籍
---

<script setup>
const files = import.meta.glob('/public/books/**/*');

const catMap = {}

Object.keys(files).forEach((path, a) => {
    const paths = path.split('/').splice(3)
    const name = paths.pop().split('.')[0]
    const category = paths[0]|| 'JavaScript'
    let list = catMap[category] || []
    list.push({
        name,
        category,
        href: path.replace('/public/books/', './')
    })
    catMap[category] = list
})
</script>
<div class="custom-block" v-for="(list, key, index) in catMap" :key="key"
    :class="[index %2 === 0 ? 'tip' : 'warning']">
    <p class="custom-block-title">{{key}}</p>
    <div class="custom-block-content" > 
        <a v-for="item in list" :key="item.name" class="VPLink link" :href="item.href">
            {{item.name}}
        </a>
    </div>
</div>

<style scoped>
    .custom-block-content {
        display: flex;
        flex-wrap: wrap;
        margin-top: 16px;
    }
    .VPLink {
        width: 25%;
        min-width: 250px;
        margin-bottom: 8px;
    }
</style>