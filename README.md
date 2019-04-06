# my-jquery-grid
一个通用的表格组件, 可实表格的查询, 过滤, 排序, 分页, 配合后端封装, 可省去很多重复代码

## 使用攻略

### 前端

```js
layui.define(['layer', 'grid', 'form'], function (exports) {
   var grid = _$this.find('.user-list').grid({
        ...
   }) 
});
```

> 这是一个带有显示, 过滤(支持几种类型), 排序的 基于 bootstrap 的表格组件, 使用 ajax 获取数据来源  
可与后端配合, 经过深度封装可实现任意实体的查询过滤, 而不需要重复的无用功代码

### 后端
>添加 jar 包依赖, 可从 release 获取 最新 jar  
然后根据 例子 接入你的程序  
大致流程应如下:  

```
js 发起 ajax 请求 --> controller 接收并解析 json 格式参数到 ParamVo 类 
--> controller 将 paramVo 传给 service ---> service 根据 paramVo 查询出结果
--> service 将 Page 返回 controller --> controller 将 page 和 code 及 msg 等一同打包成 json 格式返回前端
```

>为此, 我将 ParamVo 放进了 jar 包, 引入 jar 即可  
同时 定义了一个 AbstractPage 用于给你的 Page 继承以发挥多态的作用  
还有 IGridService, 你可以使用你的业务 service 实现它, 或者使用你以封装的 IBaseService 实现它  
你还可以再定义一个更多功能的一个专门负责 grid 的接口, 为了扩展性, 你可以容许结构更复杂, 但他会给你带来更多好处!  
  对于默认实现的封装, 如是 mybatis, 建议使用 sqlIntercept, 拦截然后拼接 SQL, 理论上可做到通用


### 例子
就在 com.guddqs.grid.example 中, 由于这个流程是比较完整的, 所以很多地方是伪代码, 注释. 仅供参考