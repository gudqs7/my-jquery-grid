# 示例
### HTML
```html
<!-- 省去引入 css 和 script -->
<select name="courseType"
    data-grid-search-form="my-search"
     data-grid-on="change" style="width: 164px;">
    <option value="-1" selected>全部</option>
    <!-- ... -->
</select>
<input data-grid-keydown name="id">
<button data-grid-search data-grid-search-form="my-search">Search</button>
<div class="xxx-wrapper">
    <div class="col-xs-12">
        <div class="some-list">
        </div>
    </div>
</div>
```

### JS 示例
```js
var backGrid = $('.some-list').jq_grid({
    url: '/xxx/findAll',
    page:{
        pageSize: 1
    },
    columns: [
        {
            dataIndex: "productName",
            text: "活动商品",
            filter: {
                override: 'product_name'
            }
        }, {
            dataIndex: "ctNumber",
            text: "成团人数",
            filter: {
                override: 'ct_number'
            }
        }, {
            dataIndex: "originalPrice",
            text: "商品原价(元)",
            width: 150,
            filter: {
                override: 'original_price'
            }
        }, {
            dataIndex: "ptPrice",
            text: "活动价格(元)",
            width: 150,
            filter: {
                type:'numeric',
                override: 'pt_price'
            }
        }, {
            dataIndex: "startTime",
            text: "活动开始时间",
            width: 150,
            filter: {
                type:'date',
                override: 'start_time'
            }
        }, {
            dataIndex: "endTime",
            text: "活动结束时间",
            width: 150,
            filter: {
                override: 'end_time'
            }
        }, {
            dataIndex: "checkNumber",
            text: "查看人数",
            filter: {
                override: 'check_number'
            }
        }, {
            dataIndex: "shareNumber",
            text: "分享人数",
            filter: {
                override: 'share_numer'
            }
        }, {
            dataIndex: "",
            text: "报名人数",
            renderer: function (_, record) {
                var ctNumber = record.ctNumber;
                var signNumber = record.signNumber;
                if (signNumber > 0) {
                    var $sign = $('<a href="javascript:void(0) ;" >' + signNumber + '</a>');
                    $sign.on('click', function () {
                        showAllCtModal(record.id, ctNumber, signNumber);
                    });
                    return $sign;
                } else {
                    return signNumber;
                }
            }
        },
        {
            dataIndex: 'status',
            text:'状态',
            renderer: function (data) {
                var text = (parseInt(data) === 1 ? '启用中' : '禁用中');
                if (parseInt(data) === 2) {
                    text = '已结束';
                }
                return text;
            },
            filter: {
                type: 'radio',
                store: [{id: 1, text: '启用'}, {id: 0, text: '禁用'}, {id: 2, text: '已结束'}],
                override: 'p.status'
            }
        },
        {
            dataIndex: "",
            text: "操作",
            width: 200,
            renderer: function (data, record) {
                var status = '<i class="fa fa-unlock op-able"> 启用</i>';
                if (record.status === 1) {
                    status = '<i class="fa fa-lock op-able"> 禁用</i>';
                }
                var $span = $('<span>' +
                        '<label class="label-default label-info"><i class="fa fa-edit"> 编辑</i></label>' +
                        '<label class="label-default label-warning"> ' + status + ' </label>' +
                        '<label class="label-default label-danger op-delete"><i class="fa fa-trash"> 删除</i></label>' +
                        '</span>');
                $span.find('i.fa-edit').click(function () {
                    
                });
                $span.find('i.op-able').click(function () {
                   
                });
                $span.find('i.fa-trash').click(function () {
                    
                });
                return $span;
            }
        }
    ],
    doubleClick: function (tr, record, grid) {
       // double click event 
    }
});
```

### js 分析

#### column 分析
```js
var column = {
    dataIndex: "status",
    text: "状态",
    renderer: function (data) {
        if (data == 1) {
            return "启用";
        } else if (data == 0) {
            return "禁用";
        } else {
            return "过期";
        }
    },
    filter: {
        type: 'checkbox',
        override: 'd.status',
        store: function () {
            return [{id: 0, text: '启用'}, {id: 1, text: '禁用'}]
        }
    }
};
```

>dataIndex 详解  
￼首先, 其主要作用是给排序及过滤传递 字段名 用的, 其次还可以用来 另该列不参与排序及过滤(如操作列) , 要实现这种需求, 只需 给 dataIndex 一个空字符串或去除 dataIndex    

>renderer 详解  
￼而 renderer 是为了重写 tbody 里tr的每个 td , 比如本来 td 的内容是 0 (枚举值), 我要覆盖成 启用| 禁用.  
￼这个函数的的参数是(data, record, column)  
￼其中 data 是原本的值, record 是对应行的一整条记录 ,column 是 dataIndex( 一般不用加)  
 renderer 可返回一个 jQuery 对象, 可以给这个对象绑定的事件等操作

>filter 详解  
￼主要是用来配置过滤的 , 属性有 type(numeric|string|date|checkbox|radio) , store( 为CheckBox 和 radio 提供数据, 数据格式为 {id: 1,text: '1'} , 对应过滤值及显示文字; 可以传递一个函数, 函数再返回数组即可)   
￼其次用来解决列名不一, 多表查询列名重复需前缀确定, 配置 override 即可  

#### 返回值 `backGrid` 分析
```js
backGrid.refresh(); // 刷新
backGrid.getCheckedIds(); // 获取所有选择 id(id 的取值字段默认是 'id', 可通过配置修改)
backGrid.getCheckedItems(field);// 根据字段名获取所有选择的数据, 如果不传参数, 则返回整个实体数据
backGrid.selectRow(rows, isSelectBackground); // 选择传入的行对应的 id (可为数组或单行), 第二个参数控制是否同时改变背景色, 默认为 false
backGrid.selectAllRow(checked); // 选择所有行|取消所有选中
backGrid.loadWithOther(other); // 根据传入对象发起查询, 需前后端配合

```
#### data-api 分析
> data-Api 作用是, 通过 HTML 里写 data-xxx, 来实现事件绑定, 包括查询, 刷新  
 支持, select, input, 按钮点击, 通过 data-grid-on 可实现更多触发
  
  
> 绑定 data-api 规则如下:  
    * data-grid-search : 绑定点击   data-grid-on : 指定绑定事件   data-grid-keydown: 绑定回车事件  
    * data-grid-search-xxx : 指定一些参数 
        data-grid-search-form --> 指定搜索表单
        data-grid-search-key --> 指定搜索 字段
        data-grid-search-filter --> 指定搜索将通过 filter 传递表单值
    * 其他 api: data-grid-refresh , 为按钮绑定刷新事件  
同时 name 为默认的字段名称, $('xxx').val() 为搜索值

```

 