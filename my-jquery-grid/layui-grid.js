/**
 * 重复调用, 但不一定经常调用的东西放这里
 */
layui.define(['jquery', 'form', 'laydate', 'laypage'], function (exports) {

    var $ = layui.$, laydate = layui.laydate, laypage = layui.laypage;

    var Grid = function (element, _options) {
        this.$wrapper = $('.body-item.active');
        this.urlId = this.$wrapper.data('url');
        this.init($(element), _options);
    };

    var ROW_DEFAULT_WIDTH = 110;
    Grid.prototype = {
        /**
         * 默认配置
         */
        getDefaultOption: function () {
            return {
                url: '',
                async: true,
                columns: [],
                height: 60,
                idField: 'id',
                page: {
                    pageNo: 1,
                    pageSize: 30
                },
                multiSelect: true,
                enableSort: true,
                enableStaticSort: false,
                enableFilter: true,
                enablePage: true,
                dataApi: true,
                callback: function () {
                },
                beforeLoad: function (_this) {
                },
                afterLoad: function () {
                },
                doubleClick: function () {
                }
            }
        },
        /**
         * 系统 右侧的 iframe 高度
         */
        getModuleHeight: function () {
            return window.moduleHeight;
        },
        /**
         * 所有数据
         */
        getStore: function (field) {
            var that = this;
            var items = [];
            that.$this.find('.table_body > table > tbody > tr').each(function (index, item) {
                var trData = $(item).data();
                if (trData) {
                    if (field) {
                        items.push(trData[field]);
                    } else {
                        items.push(trData);
                    }
                }
            });
            return items;
        },
        /**
         * 根据字段名返回选中的行[字段] 的数据, 不给字段默认返回整行数据
         */
        getCheckedItems: function (field) {
            var that = this;
            var items = [];
            that.$this.find('.table_body > table > tbody > tr').each(function (index, item) {
                var checked = $(item).find('td.td-check input')[0].checked;
                if (checked) {
                    var trData = $(item).data();
                    if (trData) {
                        if (field) {
                            items.push(trData[field]);
                        } else {
                            items.push(trData);
                        }
                    }
                }
            });
            return items;
        },
        /**
         * 返回所有选中 id
         */
        getCheckedIds: function () {
            return this.getCheckedItems(this.options.idField);
        },
        /**
         * 刷新表格
         */
        refresh: function () {
            if (!this.loaded) {
                this.loaded = true;
                var that = this;
                this.load(this.getDefaultParam(), function (page) {
                    that.page(page.total);
                });
            }
        },
        /**
         * 根据 id 数组选中 记录行
         * @param rows rw
         * @param background 是否同时添加背景色, 默认 false
         */
        selectRow: function (rows, background) {
            var that = this;
            background = background || false;
            if (rows) {
                var select0 = function (row0) {
                    var $input = that.$this.find('.table_body > table > tbody > tr[data-id=' + row0 + '] > td.td-check > input');
                    if ($input && $input.length > 0) {
                        if (background) {
                            $input.click();
                        } else {
                            $input[0].checked = true;
                        }
                    }
                };
                if (rows.constructor && 'Array' === rows.constructor.name) {
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        select0(row)
                    }
                } else {
                    select0(rows);
                }
            }
        },
        /**
         * 改变所有行的 选中状态
         * @param checked
         */
        selectAllRow: function (checked) {
            var that = this;
            that.$this.find('table > tbody > tr > td.td-check input').each(function () {
                this.checked = checked || true;
                if (checked) {
                    $(this).parents('tr').addClass('grid-selected');
                } else {
                    $(this).parents('tr').removeClass('grid-selected');
                }
            });
        },
        /**
         * 设置高度
         * @param height
         */
        setHeight: function (height) {
            this.$this.find('.grid-content').height(height + 'px');
            this.$this.find('.grid-content .table_body').css('height', parseFloat(height - 40) + 'px');
        },
        /**
         * 分页跳转
         * @param pageNo
         * @param totalPages
         */
        jumpPage: function (pageNo, totalPages) {
            if (pageNo < 1) {
                pageNo = 1;
            }
            if (pageNo > totalPages) {
                pageNo = totalPages;
            }
            this.$page.pageNo = pageNo;
            this.loadBySubmit();
        }
        ,
        /**
         * 根据 other 过滤, other 在后台通过 paramVo.getOther()获取
         * @param other
         * @param reqParam 后天通过 req.getXx 可获取的参数
         */
        loadWithOther: function (other, reqParam) {
            this.$other = other;
            this.$page.pageNo = 1;
            this.loadBySubmit($.extend({
                pageNo: 1,
                other: other,
                filter: []
            }, reqParam))
        },
        /**
         * 根据 FilterVo 过滤, 即表字段 加 判断条件
         * @param filter
         * @param reqParam
         */
        loadWithFilter: function (filter, reqParam) {
            var that = this;
            if (filter) {
                that.checkExistsFilter(filter.field, true);
                this.$filter.push(filter);
            }

            this.$page.pageNo = 1;
            this.load($.extend(this.getDefaultParam(), {
                pageNo: 1,
                filter: this.$filter,
                other: $.extend({}, this.$other, reqParam || {})
            }), function (page) {
                that.page(page.total);
            });
        }
        ,
        checkExistsFilter: function (field, needDelete) {
            var that = this;
            for (var i = 0; i < that.$filter.length; i++) {
                var item = that.$filter[i];
                if (item.field === field) {
                    if (needDelete) {
                        that.$filter.splice(i, 1);
                    }
                    return false;
                }
            }
            return true;
        }
        ,
        /**
         * 封装load加载
         * @param param
         */
        loadBySubmit: function (param) {
            var _param = this.getDefaultParam();
            if (param) {
                _param = $.extend(_param, param);
            }
            this.load(_param);
        },
        /**
         * load默认请求参数
         * @param _param
         */
        getDefaultParam: function (_param) {
            var that = this;
            var pageNo = that.$page.pageNo;
            var pageSize = that.$page.pageSize;
            var defaultParam = {
                pageNo: pageNo,
                pageSize: pageSize,
                sort: that.$sort,
                filter: that.$filter,
                other: that.$other
            };
            return $.extend({}, defaultParam, _param || {});
        }
        ,
        /**
         * 绑定排序事件
         */
        bindSortEvent: function () {
            var that = this;
            var $tableHead = that.$this.find('.table_head');
            var $tableBody = that.$this.find('.table_body');
            var sortList = that.$sort;
            for (var i = 0; i < sortList.length; i++) {
                var ord = sortList[i];
                if (ord) {
                    var direction = ord.direction;
                    var icon = 'fa-sort-up';
                    if (direction == 'asc') {
                        icon = 'fa-sort-up';
                    } else if (direction == 'desc') {
                        icon = 'fa-sort-down';
                    }
                    $tableHead.find('thead th.column-th[data-column=' + ord.field + ']').data('direction', direction);
                    $tableHead.find('thead th.column-th[data-column=' + ord.field + '] .column-name i').attr('class', '').addClass('fa ' + icon);
                }
            }
            $tableHead.find('thead th.column-th').on('click', function (ev) {
                if (that.sorted) {
                    return false;
                }

                $tableHead.find('thead th.column-th').removeClass('sorting');
                $(this).addClass('sorting');
                if ($(this).find('i').length === 0) {
                    return false;
                }
                var column = $(this).data('column');
                $tableBody.find('.column-filter').removeClass('active');
                var direction = $(this).data('direction');
                if (!direction) {
                    direction = 'default';
                }
                var oldClass = $(this).find('i').attr('class');
                var nextDir = 'asc';
                var nextIcon = 'fa-sort-up';
                if (direction == 'default') {
                    nextDir = 'desc';
                    nextIcon = 'fa-sort-down';
                } else if (direction == 'asc') {
                    nextDir = 'default';
                    nextIcon = 'fa-sort';
                } else if (direction == 'desc') {
                    nextDir = 'asc';
                    nextIcon = 'fa-sort-up';
                }
                var _colConfig = $(this).find('.column-filter').data();
                var sortObj = {
                    field: column,
                    direction: nextDir
                };
                if (column && _colConfig && _colConfig.hasOwnProperty('filter') && _colConfig['filter']['override']) {
                    sortObj.override = _colConfig.filter.override;
                }
                var sort = [sortObj];
                that.sort(sort);
                $tableHead.find('thead th.column-th').data('direction', 'default');
                $tableHead.find('thead th.column-th .column-name i').not($(this)).attr('class', 'fa fa-sort');
                $(this).find('.column-name i').removeClass(oldClass).addClass('fa').addClass(nextIcon);
                $(this).data('direction', nextDir);
            });
        }
        ,
        /**
         * 绑定过滤事件
         */
        bindFilterEvent: function () {
            var that = this;
            var $tableHead = that.$this.find('.table_head');
            var $tableBody = that.$this.find('.table_body');
            $tableHead.find('thead th.column-th .column-filter').on('click', function (ev) {
                var column = $(this).data().dataIndex;
                $tableBody.find('.column-filter ul').hide();
                var $otherTh = $tableBody.find("[data-column=" + column + "]");
                $otherTh.find('.column-filter').trigger("click");
                $otherTh.find('.column-filter').addClass('active');
                ev.stopPropagation();
                $(window).not($otherTh.find('.column-filter')).click(function () {
                    $otherTh.find('.column-filter').find('ul').hide();
                })
            });
            $tableBody.find('thead th.column-th .column-filter').on('click', function (ev) {
                ev.stopPropagation();
                var column = $(this).parents('th').data('column');
                var $otherTh = $tableHead.find("[data-column=" + column + "]");
                var getLocation = function (_this, $columnDown) {
                    var $th = $(_this).parents('th');
                    var index = $th.index();
                    var thLength = $(_this).parents('thead').find('th').length;
                    if (thLength - index === 2) {
                        var downWidth = $columnDown.width();
                        var lastThWidth = $th.parents("thead").find("th:last").width();
                        if (downWidth - 10 > lastThWidth) {
                            $columnDown.css('right', 5 + 'px').css('left', 'none');
                            return true;
                        }
                    } else if (thLength - index === 1) {
                        $columnDown.css('right', 5 + 'px').css('left', 'none');
                        return true;
                    }
                    var leftAddion = that.$this.find('.table_body')[0].scrollLeft;
                    var leftBase = 0;
                    if (that.options.multiSelect) {
                        index = index - 1;
                        leftBase += $th.width() + 56;
                    } else {
                        leftBase += $th.width() - 10;
                    }
                    that.$this.find('.table_head thead').find('th.column-th:lt(' + (index) + ')').each(function () {
                        leftBase += ($(this).width() + 16);
                    });
                    $columnDown.css('left', parseInt((leftBase) - (leftAddion)) + 'px').css('right', 'none');
                    that.$this.find('.table_body').on('scroll', function () {
                        $columnDown.hide();
                    });
                };
                if ($(this).find('ul').length > 0) {
                    $(this).find('ul').show();
                    getLocation(this, $(this).find('ul'));
                    return false;
                }
                var _colConfig = $tableHead.find('table>thead>tr>th[data-column=' + column + '] .column-filter').data();
                if (column && _colConfig) {
                    var filter = _colConfig['filter'];
                    if (!filter) {
                        filter = {
                            type: "string",
                            operator: ''
                        }
                    }
                    filter.field = _colConfig.dataIndex;
                    if (!filter.type) {
                        filter.type = 'string';
                    }
                    var sortText = '';
                    if (that.options.enableSort) {
                        sortText =
                            '<li class="clear-this layui-icon" data-field="' + filter.field + '"><span class="menu-icon"><i class="fa fa-remove"></i></span><span>清除当前条件</span></li>' +
                            '<li class="clear-all layui-icon"><span class="menu-icon"><i class="fa fa-trash"></i></span><span>清空所有条件</span></li>';
                    }
                    var $columnDown = $('<ul class="column-down-menu"">' +
                        sortText +
                        '</ul>');

                    $columnDown.find('li.clear-this').on('click', function (e) {
                        var field = this.dataset.field;
                        that.checkExistsFilter(field, true);
                        that.loadWithFilter(null, {clearField: field});
                        $columnDown.remove();
                        e.stopPropagation();
                    });
                    $columnDown.find('li.clear-all').on('click', function (e) {
                        that.$filter = [{field: 'clear_all'}];
                        that.loadWithFilter(null, {clearAll: true});
                        $tableBody.find('thead th.column-th .column-filter > ul').remove();
                        e.stopPropagation();
                    });
                    var filterValue = '';
                    if (filter && ((filter.type && filter.type == 'numeric') || (filter.type && filter.type == 'date'))) {
                        filterValue = {lt: '', gt: '', eq: ''};
                    } else if (filter && filter.type && filter.type == 'checkbox') {
                        filterValue = []
                    } else if (filter && filter.type && filter.type == 'radio') {
                        filterValue = ''
                    }
                    for (i = 0; i < that.$filter.length; i++) {
                        var _filter = that.$filter[i];
                        if (column == _filter.field) {
                            if (_filter && _filter.type) {
                                if (_filter.type == 'numeric' || _filter.type == 'date') {
                                    if (_filter.operator.trim() == '<') {
                                        filterValue.lt = _filter.value;
                                    }
                                    if (_filter.operator.trim() == '>') {
                                        filterValue.gt = _filter.value;
                                    }
                                    if (_filter.operator.trim() == '=') {
                                        filterValue.eq = _filter.value;
                                    }
                                } else if (_filter.type == 'list') {
                                    if (typeof _filter.value === 'string') {
                                        var _valList = _filter.value.split(',');
                                        for (var j = 0; j < _valList.length; j++) {
                                            var _vv = _valList[j];
                                            if (!isNaN(_vv)) {
                                                _valList[j] = parseFloat(_vv);
                                            }
                                        }
                                        filterValue = _valList;
                                    } else {
                                        filterValue = _filter.value;
                                    }
                                } else {
                                    filterValue = _filter.value.replace(/%/g, '');
                                }
                            }
                            if (!_filter.operator || _filter.operator === '') {
                                filterValue = _filter.value;
                            }
                        }

                    }
                    var $li;
                    if (that.options.enableFilter) {
                        var tip = "回车过滤";
                        if (filter.type && filter.type !== 'string') {
                            if (filter.type === 'numeric') {
                                $li = $('<li><div class="input-group"> '
                                    + '<span class="input-group-addon menu-icon"><i class="fa fa-chevron-left"></i></span> '
                                    + '<input type="number" name="grid-filter-lt" data-operator="lt" autofocus class="form-control" placeholder="' + tip + '" value="' + filterValue.lt + '"> '
                                    + '</div></li>' +
                                    '<li><div class="input-group"> '
                                    + '<span class="input-group-addon menu-icon"><i class="fa fa-chevron-right"></i></span> '
                                    + '<input type="number" name="grid-filter-gt" data-operator="gt" class="form-control" placeholder="' + tip + '" value="' + filterValue.gt + '"> '
                                    + '</div></li><span class="hr-line"></span>' +
                                    '<li><div class="input-group"> '
                                    + '<span class="input-group-addon menu-icon"><i class="fa fa-pause fa-rotate-90"></i></span> '
                                    + '<input type="number" name="grid-filter-eq" data-operator="eq" class="form-control" placeholder="' + tip + '" value="' + filterValue.eq + '"> '
                                    + '</div></li>');

                                $columnDown.append($li);
                            } else if (filter.type === 'date') {
                                $li = $('<li><div class="input-group"> '
                                    + '<span class="input-group-addon menu-icon"><i class="fa fa-chevron-left"></i></span> '
                                    + '<input type="text Wdate" data-operator="lt" class="form-control input-sm" autofocus name="grid-filter-lt" placeholder="' + tip + '" value="' + filterValue.lt + '" aonClick="WdatePicker({dateFmt:\'yyyy-MM-dd HH:mm\',onpicked:function() { var e = jQuery.Event(\'keydown\'); e.keyCode = 13;$(this).trigger(e);  } });">'
                                    + '</div></li>' +
                                    '<li><div class="input-group"> '
                                    + '<span class="input-group-addon menu-icon"><i class="fa fa-chevron-right"></i></span> '
                                    + '<input type="text Wdate" data-operator="gt" class="form-control input-sm" name="grid-filter-gt" placeholder="' + tip + '" value="' + filterValue.gt + '" aonClick="WdatePicker({dateFmt:\'yyyy-MM-dd HH:mm\',onpicked:function() { var e = jQuery.Event(\'keydown\'); e.keyCode = 13;$(this).trigger(e);  } });">'
                                    + '</div></li><span class="hr-line"></span>' +
                                    '<li><div class="input-group"> '
                                    + '<span class="input-group-addon menu-icon"><i class="fa fa-pause fa-rotate-90"></i></span> '
                                    + '<input type="text Wdate" data-operator="eq" class="form-control input-sm" name="grid-filter-eq" placeholder="' + tip + '" value="' + filterValue.eq + '"  aonClick="WdatePicker({dateFmt:\'yyyy-MM-dd HH:mm\',onpicked:function() { var e = jQuery.Event(\'keydown\'); e.keyCode = 13;$(this).trigger(e);  } });">'
                                    + '</div></li>');
                                $columnDown.append($li);
                            } else if (filter.type === 'checkbox') {
                                if (filter.store && filter.store != '') {
                                    var store = filter.store;
                                    if (typeof filter.store == 'function') {
                                        store = filter.store();
                                    }
                                    console.log(filterValue);
                                    for (var i = 0; i < store.length; i++) {
                                        var storeitem = store[i];
                                        var checked = filterValue.includes(storeitem.id);
                                        console.log(filterValue, storeitem, checked);
                                        if (checked) {
                                            checked = "checked";
                                        } else {
                                            checked = ''
                                        }
                                        $li = $('<li><div class="filter-checkbox">' +
                                            '<input class="checkbox-input" lay-filter="' + that.urlId + '" type="checkbox" lay-skin="primary" name="grid-chb" ' + checked + ' value="' + storeitem.id + '"><span>' + (storeitem.text + ' ') + '</span>' +
                                            '</div></li>');
                                        $columnDown.append($li);
                                    }
                                }

                            } else if (filter.type === 'radio') {
                                if (filter.store && filter.store != '') {
                                    var store = filter.store;
                                    if (typeof filter.store == 'function') {
                                        store = filter.store();
                                    }
                                    for (var i = 0; i < store.length; i++) {
                                        var storeitem = store[i];
                                        var checked = filterValue.includes(storeitem.id);
                                        if (checked) {
                                            checked = "checked";
                                        } else {
                                            checked = ''
                                        }
                                        $li = $('<li><div class="filter-checkbox">' +
                                            '<input class="checkbox-input radio-input" lay-filter="' + that.urlId + '" type="checkbox" lay-skin="primary" name="grid-radio" ' + checked + ' value="' + storeitem.id + '"><span>' + (storeitem.text + ' ') + '</span>' +
                                            '</div></li>');
                                        $columnDown.append($li);
                                    }
                                }
                            }
                        } else {
                            $columnDown.append('<li><div class="input-group"> '
                                + '<span class="input-group-addon menu-icon"><i class="fa fa-filter"></i></span> '
                                + '<input type="text" name="grid-filter-like" class="form-control normal-search" autofocus placeholder="' + "回车过滤" + '" value="' + filterValue + '"> '
                                + '</div></li>');
                        }
                        layui.form.render();

                        if (filter.type === 'checkbox' || filter.type === 'radio') {
                            var go = function (_this) {
                                if (that.searched) {
                                    return false;
                                }
                                var name = _this.name;
                                if ($(_this).hasClass('radio-input')) {
                                    $columnDown.find('li input[name=' + name + ']').not($(_this)).removeAttr('checked');
                                    layui.form.render();
                                }
                                var ids = [];
                                $(_this).parents('.column-filter').find('input[name=' + name + ']').each(function () {
                                    if (this.checked) {
                                        var _val = $(this).val();
                                        if (isNaN(_val)) {
                                            ids.push(_val);
                                        } else {
                                            ids.push(parseFloat(_val));
                                        }
                                    }
                                });
                                var _filter = {
                                    field: filter.field,
                                    type: 'list',
                                    value: ids
                                };

                                enterFilter(that, _filter, $otherTh);
                            };
                            $columnDown.find('li').on('click', function (e) {
                                if ($(e.target).hasClass('layui-icon') || $(e.currentTarget).hasClass('layui-icon')) {
                                    return false;
                                }
                                $(this).find('input')[0].checked = !$(this).find('input')[0].checked;
                                layui.form.render();
                                go($(this).find('input')[0]);
                            });
                            layui.form.on('checkbox(' + that.urlId + ')', function (data) {
                                if ($(data.elem).hasClass('checkbox-input')) {
                                    go(data.elem);
                                }
                            });
                        }

                        $columnDown.find('input[type*=text],input[type*=number]').keyup(function (e) {
                            if (e.keyCode === 13) {
                                enterFilter(that, filter, $otherTh);
                            }
                            e.stopPropagation();
                        });
                        $columnDown.find('input[name*=grid-filter]').on('focus', function () {
                            input = this;
                        });
                    }
                    $(this).append($columnDown);
                    if (filter.type === 'date') {
                        laydate.render({
                            elem: '.body-item.active input[name*=grid-filter]',
                            format: 'yyyy-MM-dd',
                            done: function () {
                                enterFilter(that, filter, $otherTh);
                            }
                        });
                    }
                    layui.form.render();
                    getLocation(this, $columnDown);
                }

            });
        }
        ,
        /**
         * 绑定分页事件
         */
        bindPageEvent: function () {
            var that = this;
            var flag = false;
            laypage.render({
                elem: that.$this.find('.grid-page-elem')[0],
                curr: that.$page.pageNo,
                count: that.$page.total,
                limit: that.$page.pageSize,
                limits: [30, 100, 300, 800, 2000, 5000, 10000, 30000],
                layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip'],
                jump: function (obj) {
                    if (!flag) {
                        flag = true;
                        return false;
                    }
                    if (obj.curr !== that.$page.pageNo) {
                        that.jumpPage(obj.curr, that.$page.totalPages);
                    } else if (obj.limit !== that.$page.pageSize) {
                        that.$page.pageSize = obj.limit;
                        that.jumpPage(1, that.$page.totalPages);
                    } else {
                        that.refresh();
                    }
                }
            });

        }
        ,
        /**
         * 绑定 data-api 规则如下:
         * data-grid-search : 绑定点击   data-grid-on : 指定绑定事件   data-grid-keydown: 绑定回车事件
         * data-参数 : data-grid-search-form --> 指定搜索表单
         * 其他 api: data-grid-refresh , 为按钮绑定刷新事件
         */
        bindDataApiEvent: function () {
            var that = this;
            that.$wrapper.find('[data-grid-refresh]').click(function () {
                that.refresh();
            });
            var submit = function (_this) {
                var $that = $(_this);
                var key = $that.data('grid-search-key') || $that.attr('name');
                if (key) {
                    var val = $that.val() || that.$wrapper.find('[name=' + key + ']').val();
                    var filter = $that[0].hasAttribute('data-grid-search-filter');
                    if (filter) {
                        that.loadWithFilter({
                            type: 'string',
                            field: key,
                            value: val
                        });
                    } else {
                        var other = {};
                        other[key] = val;
                        that.loadWithOther(other);
                    }
                }
            };
            var submitForm = function (formName) {
                if (formName) {
                    var form = that.$wrapper.find('form[name=' + formName + ']');
                    if (form && form.length > 0) {
                        that.loadWithOther(form.serializeArray().toModel());
                    }
                }
            };
            var $gridOn = that.$wrapper.find('[data-grid-on]');
            if ($gridOn.length > 0) {
                $gridOn.each(function (index, item) {
                    var $item = $(item);
                    var event = $item.data('grid-on');
                    var formName = $item.data('grid-search-form');
                    $item.on(event, function () {
                        if (formName) {
                            submitForm(formName);
                        } else {
                            submit(this);
                        }
                    });
                });
            }
            that.$wrapper.find('[data-grid-keydown]').on('keydown', function (e) {
                if (e.keyCode === 13) {
                    var formName = $(this).data('grid-search-form');
                    if (formName) {
                        submitForm(formName);
                    } else {
                        submit(this);
                    }
                }
            });

            that.$wrapper.find('[data-grid-search]').on('click', function () {
                var $that = $(this);
                var formName = $that.data('grid-search-form');
                submitForm(formName);
            });
        },
        sort: function (sort) {
            var that = this;
            if (sort.length > 0) {
                var so = sort[0];
                if (that.options.enableStaticSort || that.options.url === '') {
                    var field = so.field;
                    var dir = so.direction;
                    // asc desc default
                    var items = that.getStore();
                    that.$body.find('table tbody').empty();
                    items = items.sort(function (a, b) {
                        var b2 = b[field];
                        var a2 = a[field];
                        if (!isNaN(b2)) {
                            b2 = parseFloat(b2);
                            a2 = parseFloat(a2);
                        }
                        if (dir === 'desc') {
                            return a2 > b2 ? -1 : 1;
                        } else {
                            return a2 > b2 ? 1 : -1;
                        }
                    });
                    that.addRows(items);
                    layui.form.render();
                    that.initBodyEvent();
                } else {
                    var nextDir = so.direction;
                    if (nextDir === 'default') {
                        sort = [];
                    }
                    var param = {
                        filter: that.$filter,
                        sort: sort
                    };
                    that.sorted = true;
                    that.$sort = sort;
                    that.loadBySubmit(param);
                }
            }
        },
        /**
         * 绑定所有事件
         */
        initEvent: function () {
            var that = this;
            var $tableBody = that.$this.find('.table_body');
            if (that.options.enableSort) {
                that.bindSortEvent();
            }
            if (that.options.enableFilter) {
                that.bindFilterEvent();
            }
            if (that.options.dataApi) {
                that.bindDataApiEvent();
            }
            that.$this.find('.table_body tr td input[type=checkbox]').on('click', function (e) {
                e.stopPropagation();
            });

            that.$this.find('.table_head tr > th.td-check').on('click', function (e) {
                var checked = $(this).find('input')[0].checked;
                that.$this.find('table > tbody > tr > td.td-check input').each(function () {
                    this.checked = checked;
                    if (checked) {
                        $(this).parents('tr').addClass('grid-selected');
                    } else {
                        $(this).parents('tr').removeClass('grid-selected');
                    }
                });
                layui.form.render();
                if (that.options.callback !== null) {
                    that.options.callback(false, false, that);
                }
                e.stopPropagation();
            });
            // that.$this.find('.table_head tr > th.td-check').on('click', function () {
            //     $(this).find('input').click();
            // });

            $tableBody.on('scroll', function (e) {
                var scrollLeft = $tableBody.scrollLeft();
                var headWidth = that.$this.find('.table_head').width();
                var headScrollWidth = that.$this.find('.table_head')[0].scrollWidth;
                that.$this.find('.table_head').scrollLeft(scrollLeft);
                if (scrollLeft > headScrollWidth - headWidth) {
                    var a = scrollLeft - (headScrollWidth - headWidth);
                    var oldPadding = that.$this.find('.table_head thead th:last').find('.column-filter').css('padding-right');
                    that.$this.find('.table_head thead th:last').find('.column-filter').css('padding-right', (parseInt(oldPadding) + (a)) + 'px');
                    var w = that.$this.find('.table_head thead th:last').width();
                    that.$this.find('.table_head thead th:last').css({
                        width: w + a,
                        maxWidth: w + a,
                        minWidth: w + a
                    });
                }
            });

            var headWidth = that.$this.find('.table_head').width();
            var bodyTableWidth = $tableBody.find('table').width();

            if (bodyTableWidth < headWidth) {
                var a = headWidth - bodyTableWidth - 4;
                var oldPadding = that.$this.find('.table_head thead th:last').find('.column-filter').css('padding-right');
                that.$this.find('.table_head thead th:last').find('.column-filter').css('padding-right', (parseInt(oldPadding) + (a)) + 'px');
                var w = parseInt(that.$this.find('.table_head thead th:last').data('width'));
                that.$this.find('.table_head thead th:last').css({
                    width: w + a,
                    maxWidth: w + a,
                    minWidth: w + a
                });
            }

            window.addEventListener('resize', function () {
                that.setHeight(that.getModuleHeight() - that.options.height);
            });

        },
        /**
         * 绑定 tbody 行选中, 点击事件, 每次 load 重复调用
         */
        initBodyEvent: function () {
            var that = this;
            that.$this.find('.table_body tr').on('click', function () {
                if (that.options.multiSelect) {
                    var inputElement = $(this).find('td input')[0];
                    inputElement.checked = !(inputElement.checked);
                    layui.form.render();
                    if (inputElement.checked) {
                        $(this).addClass('grid-selected');
                    } else {
                        $(this).removeClass('grid-selected');
                    }
                }
                if (that.options.callback !== null) {
                    that.options.callback($(this), $(this).data(), that);
                }
            });
            that.$this.find('.table_body tr').dblclick(function (e) {
                if (e.target.nodeName === 'TD') {
                    if (that.options.doubleClick !== null) {
                        that.options.doubleClick($(this), $(this).data(), that, e);
                    }
                }
            });
            that.$this.find('.table_body tr td.td-check').on('click', function (e) {
                var checked = $(this).find('input')[0].checked;
                if (checked) {
                    $(this).parents('tr').addClass('grid-selected');
                } else {
                    $(this).parents('tr').removeClass('grid-selected');
                }
                if (that.options.callback !== null) {
                    that.options.callback(this, $(this).parents('tr').data(), that);
                }
                e.stopPropagation();
            });
        }
        ,
        /**
         * 入口
         */
        init: function (_$this, _options) {
            this.options = $.extend({}, this.getDefaultOption(), _options);

            this.$sort = [];
            this.$filter = [];
            this.$other = {};
            this.$page = {
                pageNo: this.options.page.pageNo || 1,
                pageSize: this.options.page.pageSize || 20
            };

            this.$this = _$this;
            _$this.append(this.html());

            this.$head = _$this.find('.grid-wrapper>.grid-content>div.table_head');
            this.$body = _$this.find('.grid-wrapper>.grid-content>div.table_body');

            this.$head.append('<table class="table my-table"></table>');
            this.$body.append('<table class="table my-table"></table>');

            this.header();
            this.body();

            if (this.options.height) {
                this.setHeight(this.getModuleHeight() - this.options.height);
            }

            var that = this;
            this.load(that.getDefaultParam(), function (page) {
                that.page(page.total);
                that.initEvent();
            });
        }
        ,
        /**
         * 渲染 表格头部
         */
        header: function () {
            var checkTh = '';
            if (this.options.multiSelect) {
                checkTh = '<th class="td-check"><input type="checkbox" lay-skin="primary" title=""></th>';
            }
            var $thead = $('<thead><tr>' + checkTh + '</tr></thead>');
            var columns = this.options.columns;
            for (var i = 0; i < columns.length; i++) {
                var col = columns[i];
                var width = col.width ? col.width : ROW_DEFAULT_WIDTH;
                var colNameWidth = width - 30;
                var sort = (this.options.enableSort && col.dataIndex && col.dataIndex !== '') ? ('<i class="fa fa-sort"></i>') : '';
                var filter = (this.options.enableFilter && col.dataIndex && col.dataIndex !== '') ? $('<div class="column-filter"><i class="fa fa-caret-down"></i></div>') : '';

                var $th = $(
                    '<th data-width="' + width + '" data-direction="default" class="column-th" data-column="' + col.dataIndex + '">\
                        <div class="column-name">' + (col.text || '') + ' &ensp;\
                            ' + sort + '\
                        </div>\
                    </th>');
                $th.append(filter);
                $th.find('.column-filter').data(col);
                $th.css({
                    'width': width,
                    'min-width': width,
                    'max-width': width
                });
                if (col.align && col.align !== '') {
                    $th.css('text-align', col.align);
                }
                $th.find('.column-name').css({
                    'width': colNameWidth,
                    'min-width': colNameWidth,
                    'max-width': colNameWidth
                });
                $thead.find('tr').append($th);
            }
            this.$head.find('table').append($thead);
            this.$body.find('table').append($thead.clone());
        },
        /**
         * 渲染 表格行记录
         */
        body: function () {

        },
        addRow: function (record) {
            var that = this;
            that.$body.find('table tbody').append(that.renderRow(record));
        },
        addRows: function (record) {
            var that = this;
            for (var i = 0; i < record.length; i++) {
                var row = record[i];
                that.$body.find('table tbody').append(that.renderRow(row));
            }
            that.$this.find('.grid-page .static-count > span').html(record.length);
        },
        /**
         * 渲染具体行
         */
        renderRow: function (row) {
            var checkTd = '';
            if (this.options.multiSelect) {
                checkTd = '<td class="td-check" align="center"><input type="checkbox" lay-skin="primary" name="checkedIds" value="' + row[this.options.idField] + '" title=""></td>';

            }
            var $tr = $('<tr data-id="' + row[this.options.idField] + '">' + checkTd + '</tr>');
            $tr.data(row);
            var columns = this.options.columns;
            for (var i = 0; i < columns.length; i++) {
                var col = columns[i];
                var width = col.width ? col.width : ROW_DEFAULT_WIDTH;
                var data = row[col.dataIndex];
                if (data !== 0) {
                    data = data || ''
                }
                if (col.renderer) {
                    data = col.renderer(row[col.dataIndex], row, $tr, i, col);
                }
                var $td = $(
                    '<td data-width="' + width + '" data-column="' + col.dataIndex + '"> </td>'
                );
                $td.append(data);
                $td.css({
                    'width': width,
                    'min-width': width,
                    'max-width': width
                });
                if (col.css) {
                    $td.css(col.css)
                }
                if (col.align && col.align !== '') {
                    $td.css('text-align', col.align);
                }
                $tr.append($td);
            }
            return $tr;
        },
        /**
         * ajax 加载数据
         */
        load: function (_param, callback) {
            if (!_param.other.clearAll) {
                if (this.options.beforeLoad) {
                    this.options.beforeLoad(_param);
                }
            }
            this.load0(_param, callback);
        },
        /**
         * ajax 加载数据
         */
        load0: function (_param, callback) {
            var that = this;
            if (!that.options.url || that.options.url === '') {
                var $tbody = $('<tbody></tbody>');
                that.$body.find('table').append($tbody);
                that.$head.find('table').append($tbody.clone());
                that.$this.find('.grid-page').append('<span class="static-count">共计: <span></span>条</span>');
                that.initEvent();
                return false;
            }

            var error0 = function (errMsg) {
                if (errMsg) {
                    $.tip.error(errMsg);
                } else {
                    that.page(0);
                }
                that.sorted = false;
                that.searched = false;
                that.loaded = false;
                that.$this.find('tbody').empty();
                that.$this.find('.table_body').append(that.noData());
                that.$this.find('.table_body table').show();
                that.$this.find('.grid-loading').hide();
            };

            that.$this.find('.table_body').find('div.grid-not-data').remove();
            that.$this.find('tbody').remove();
            that.$this.find('.grid-loading').show();
            request.ajax({
                type: 'POST',
                url: that.options.url,
                async: that.options.async,
                data: JSON.stringify(_param),
                contentType: "application/json",
                dataType: 'json',
                success: function (res) {
                    if (res && typeof res === 'object') {
                        var page = res;
                        if (page && page.success && page.data && page.data.length > 0) {

                            var $tbody = $('<tbody></tbody>');
                            for (var i = 0; i < page.data.length; i++) {
                                var getRandom = function (min, max) {
                                    return parseInt(Math.random() * (max - min) + min);
                                };
                                var row = page.data[i];
                                row = $.extend({}, row, {'grid_random': getRandom(1, that.$page.pageSize * 3)});
                                $tbody.append(that.renderRow(row));
                            }

                            setTimeout(function () {
                                that.$body.find('table').append($tbody);
                                that.$head.find('table').append($tbody.clone());

                                if (callback) {
                                    callback(page);
                                }
                                that.initBodyEvent();

                                that.sorted = false;
                                that.searched = false;
                                that.loaded = false;

                                that.$this.find('.table_body table').show();
                                that.$this.find('.grid-loading').hide();

                                layui.form.render();
                                if (that.options.afterLoad) {
                                    that.options.afterLoad(that);
                                }
                            }, 200);

                        } else {
                            error0();
                        }
                    } else {
                        console.log(res);
                        error0('系统开小差了, 请稍后重试!');
                    }
                }, error: function (err) {
                    console.log(err);
                    error0('网络错误, 请刷新后重试!');
                }

            })
        },
        /**
         * 加载 page 分页
         * @param total
         */
        page: function (total) {
            var page = {
                total: total,
                pageNo: this.$page.pageNo,
                pageSize: this.$page.pageSize
            };
            if (this.options.enablePage) {
                var totalPages = (page.total % page.pageSize === 0) ? (page.total / page.pageSize) : (Math.floor(page.total / page.pageSize) + 1);
                this.$page = page = $.extend(page, {
                    totalPages: totalPages,
                    hasPrePage: page.pageNo - 1 > 0,
                    hasNextPage: page.pageNo + 1 <= totalPages
                });
                this.$this.find('.grid-page').empty().append('<div class="grid-page-elem"></div>');
                this.bindPageEvent();
            } else {
                this.$this.find('.grid-page').remove();
            }
        },
        /**
         * html 代码结构
         * @returns {string}
         */
        html: function () {
            return ('' +
                '<form onsubmit="return false" class="layui-form">' +
                '   <div class="grid-wrapper theme-pengcheng">' +
                '   <div class="grid-content">' +
                '       <div class="table_head"></div>' +
                '       <div class="table_body">' +
                '       <div align="center" class="grid-loading" style="display: none; position: absolute;top: 10px;left: 47%;">' +
                '           <i class="fa fa-spinner fa-spin" style="font-size:34px; margin: 50px 20px; color: black"></i>' +
                '       </div>' +
                '       </div>' +
                '       <div class="grid-page row"></div>' +
                '   </div>' +
                '   </div>' +
                '</form>');
        },
        /**
         * 无数据 HTML
         */
        noData: function () {
            return (
                '<div class="grid-not-data">' +
                '    <img src="/admin/res/img/data-null.png" width="180" height="120">' +
                '</div>'
            );
        }

    };
    var input;

    var enterFilter = function (that, filter, $th) {
        var $tableHead = that.$this.find('.table_head');
        $tableHead.find('thead th.column-th').removeClass('searching');
        $th.addClass('searching');
        if (input) {
            $(input).parents('.column-down-menu').find('input[name*=grid-filter]').not(input).val('');
            if (filter.type !== 'list') {
                filter.value = $(input).val().trim();
            }
        }
        if (that.searched) {
            return false;
        }
        if (filter.type === 'numeric' || filter.type === 'date') {
            filter.operator = $(input).data('operator');
        }
        that.searched = true;
        that.loadWithFilter(filter);

    };

    $.fn.grid = function (_options) {
        var that = this;
        return new Grid(that, _options);
    };

    exports('grid', Grid);

}).link('layui-grid.css');