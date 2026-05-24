# 每日一语

一个每日语录小应用，使用 React + Vite 构建，并通过 Capacitor 打包为 iOS App。

## 本地 Web 运行

```bash
npm install
npm run dev
```

浏览器打开终端显示的本地地址即可。

## iOS 运行

前置要求：

- macOS
- Xcode
- Node.js

首次安装依赖：

```bash
npm install
```

同步 Web 构建到 iOS 工程：

```bash
npm run ios:sync
```

打开 Xcode 工程：

```bash
npm run ios:open
```

在 Xcode 中选择模拟器或真机，点击 Run 即可运行。需要改包名时，修改 `capacitor.config.ts` 里的 `appId`，然后重新执行 `npm run ios:sync`。

## PWA 安装到 iPhone

如果只是自己长期使用，可以把它当作 PWA 添加到主屏幕，不需要 App Store，也不会遇到开发签名过期的问题。

1. 部署这个项目，获得一个 HTTPS 地址。
2. 在 iPhone 上用 Safari 打开该地址。
3. 点击分享按钮。
4. 选择“添加到主屏幕”。
5. 从桌面图标打开“每日一语”。

本地 `localhost` 只适合预览；真正放到手机长期使用时，需要部署到 HTTPS 服务。

## 常用命令

```bash
npm run lint
npm run build
npm run ios:sync
npm run ios:open
```
