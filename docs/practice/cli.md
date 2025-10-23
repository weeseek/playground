# 定制化脚手架开发

## 脚手架核心功能实现

一个完整的脚手架工具通常包括以下几个核心功能：

### 1. 命令解析与处理

脚手架工具需要能够解析用户的命令行输入，并根据不同的命令执行相应的操作。例如，创建项目、添加组件、运行开发服务器等。

```javascript
// bin/index.js
#!/usr/bin/env node

const program = require('commander');
const { createProject } = require('../lib/create');

program
  .version(require('../package.json').version)
  .command('create <project-name>')
  .description('create a new project')
  .action((name) => {
    createProject(name);
  });

program.parse(process.argv);
```

### 2. 模板下载与管理

脚手架的核心在于模板的管理和使用。通常会从远程仓库下载模板，并支持多种模板的选择。

```javascript
// lib/downloadTemplate.js
const { promisify } = require('util');
const download = promisify(require('download-git-repo'));
const ora = require('ora');

async function downloadTemplate(templateUrl, projectName) {
  const spinner = ora('downloading template...').start();
  
  try {
    await download(templateUrl, projectName, { clone: true });
    spinner.succeed('template downloaded successfully');
  } catch (error) {
    spinner.fail('failed to download template');
    throw error;
  }
}

module.exports = { downloadTemplate };
```

### 3. 用户交互

通过交互式询问用户配置选项，使脚手架更加灵活和个性化。

```javascript
// lib/create.js
const inquirer = require('inquirer');
const { downloadTemplate } = require('./downloadTemplate');

async function createProject(projectName) {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: '请选择项目模板:',
      choices: [
        { name: 'React + TypeScript', value: 'react-ts' },
        { name: 'Vue + TypeScript', value: 'vue-ts' },
        { name: 'Node.js Express', value: 'express' }
      ]
    },
    {
      type: 'confirm',
      name: 'installDeps',
      message: '是否自动安装依赖?',
      default: true
    }
  ]);

  // 根据用户选择下载对应模板
  const templates = {
    'react-ts': 'github:username/react-ts-template',
    'vue-ts': 'github:username/vue-ts-template',
    'express': 'github:username/express-template'
  };

  await downloadTemplate(templates[answers.template], projectName);

  if (answers.installDeps) {
    // 执行依赖安装逻辑
    installDependencies(projectName);
  }
}
```

## 高级特性

### 插件系统

为了增强脚手架的可扩展性，可以设计插件系统，允许第三方开发者贡献功能插件。

```javascript
// lib/pluginManager.js
class PluginManager {
  constructor() {
    this.plugins = [];
  }

  loadPlugin(pluginPath) {
    try {
      const plugin = require(pluginPath);
      this.plugins.push(plugin);
      plugin.install && plugin.install();
    } catch (error) {
      console.error(`Failed to load plugin ${pluginPath}:`, error);
    }
  }

  applyPlugins(hookName, context) {
    this.plugins.forEach(plugin => {
      if (typeof plugin[hookName] === 'function') {
        plugin[hookName](context);
      }
    });
  }
}

module.exports = PluginManager;
```

### 配置文件支持

支持项目级别的配置文件，让用户可以自定义脚手架行为。

```javascript
// lib/configLoader.js
const fs = require('fs');
const path = require('path');

function loadConfig(rootPath) {
  const configFiles = [
    'scaffold.config.js',
    '.scaffoldrc',
    '.scaffoldrc.json'
  ];

  for (const configFile of configFiles) {
    const configPath = path.join(rootPath, configFile);
    if (fs.existsSync(configPath)) {
      return require(configPath);
    }
  }

  return {};
}
```

## 发布与维护

完成开发后，可以通过 npm 或其他包管理平台发布你的脚手架工具：

1. 在 [package.json](file:///Users/baosc/Project/Github/weeseek/playground-blog/package.json) 中配置 `bin` 字段指向入口文件
2. 确保入口文件有正确的 shebang (`#!/usr/bin/env node`)
3. 运行 `npm publish` 发布到 npm 仓库

```json
{
  "name": "my-scaffold-cli",
  "version": "1.0.0",
  "bin": {
    "myscaffold": "./bin/index.js"
  },
  "dependencies": {
    "commander": "^8.0.0",
    "inquirer": "^8.1.0",
    "download-git-repo": "^3.0.2"
  }
}
```

这样用户就可以通过 `npm install -g my-scaffold-cli` 安装并使用你的脚手架工具了。