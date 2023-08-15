# 阅读笔记

1. 本版本为15.6.2,React 15.6 使用的是旧的堆栈调和器，而不是新的 Fiber 架构。因此，它的内部机制与 React 16+ 有所不同。
2. 开始阅读：
入口文件：你可以从 <strong>src/isomorphic/classic/element/ReactElement.js</strong> 开始，这里定义了 React.createElement 和相关的逻辑。
组件定义：<strong>src/isomorphic/modern/class/ReactBaseClasses.js</strong> 定义了 React.Component。
生命周期方法：在组件定义中，你会看到各种生命周期方法。
更新 & 调和：<strong>src/renderers/shared/stack/reconciler</strong> 目录下有与组件更新和调和相关的逻辑。
渲染：
DOM 渲染：<strong>src/renderers/dom/stack/client</strong> 和 <strong>src/renderers/dom/stack/server</strong> 目录包含了 React 渲染到 DOM 的逻辑。
事件系统：<strong>src/renderers/shared/stack/event</strong> 目录包含了 React 的合成事件系统。
实践 & 调试：
在你本地建立一个简单的项目，并使用你本地的 React 源码进行构建。这样，你可以进行实时的调试和更改，看看你的更改如何影响实际的行为。
