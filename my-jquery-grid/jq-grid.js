(function ($) {
    if (!Array.prototype.includes) {
        Array.prototype.includes = function (val) {
            for (var i = 0; i < this.length; i++) {
                var temp = this[i];
                if (temp === val) {
                    return true
                }
            }
            return false;
        }
    }

    var Grid = function (element, _options) {
        this.init($(element), _options);
    };

    Grid.prototype = {
        getDefaultOption: function () {
            return {
                url: '',
                async: true,
                columns: [],
                height: 60,
                idField: 'id',
                page: {
                    pageNo: 1,
                    pageSize: 20
                },
                multiSelect: true,
                enableSort: true,
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
        getModuleHeight: function () {
            return window.innerHeight;
        },
        getStore: function () {
            return this.$data;
        },
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
        getCheckedIds: function () {
            return this.getCheckedItems(this.idField);
        },
        refresh: function () {
            this.loadBySubmit();
        },
        debug: function () {
            console.log(this);
        },
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
        setHeight: function (height) {
            this.$this.find('.grid-content').height(height + 'px');
            this.$this.find('.grid-content .table_body').css('height', parseFloat(height - 35) + 'px');
        },
        jumpPage: function (pageNo, totalPages) {
            if (pageNo < 1) {
                pageNo = 1;
            }
            if (pageNo > totalPages) {
                pageNo = totalPages;
            }
            this.$page.pageNo = pageNo;
            this.loadBySubmit();
            this.page(this.$page);
        }
        ,
        loadWithOther: function (other) {
            this.loadBySubmit({
                pageNo: 1,
                other: other,
                filter: []
            })
        },
        loadWithFilter: function (filter) {
            this.loadBySubmit({
                pageNo: 1,
                filter: [filter]
            })
        }
        ,
        loadBySubmit: function (param) {
            var _param = this.getDefaultParam();
            if (param) {
                _param = $.extend(_param, param);
            }
            this.load(_param);
        },
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
                    var nextDir = 'asc';
                    if (direction == 'asc') {
                        nextDir = 'desc';
                        icon = 'fa-sort-up';
                    } else if (direction == 'desc') {
                        nextDir = 'default';
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
                    nextDir = 'asc';
                    nextIcon = 'fa-sort-up';
                } else if (direction == 'asc') {
                    nextDir = 'desc';
                    nextIcon = 'fa-sort-down';
                } else if (direction == 'desc') {
                    nextDir = 'default';
                    nextIcon = 'fa-sort';
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
                if (nextDir == 'default') {
                    sort = [];
                }
                var param = {
                    filter: that.$filter,
                    sort: sort
                };
                $tableHead.find('thead th.column-th').data('direction', 'default');
                $tableHead.find('thead th.column-th .column-name i').not($(this)).attr('class', 'fa fa-sort');
                $(this).find('.column-name i').removeClass(oldClass).addClass('fa').addClass(nextIcon);
                $(this).data('direction', nextDir);
                that.sorted = true;
                that.loadBySubmit(param);
            });
        }
        ,
        bindFilterEvent: function () {
            var that = this;
            var $tableHead = that.$this.find('.table_head');
            var $tableBody = that.$this.find('.table_body');
            $tableHead.find('thead th.column-th .column-filter').on('click', function (ev) {
                var column = $(this).data().dataIndex;
                $tableBody.find('.column-filter').removeClass('active');
                var $otherTh = $tableBody.find("[data-column=" + column + "]");
                $otherTh.find('.column-filter').trigger("click");
                $otherTh.find('.column-filter').addClass('active');
                ev.stopPropagation();
                $(window).not($otherTh.find('.column-filter')).click(function () {
                    $otherTh.find('.column-filter').removeClass('active');
                })
            });
            $tableBody.find('thead th.column-th .column-filter').on('click', function (ev) {
                ev.stopPropagation();
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
                    that.$this.find('.table_head thead').find('th.column-th:lt(' + (index) + ')').each(function () {
                        leftBase += ($(this).width() + 16);
                    });
                    $columnDown.css('left', parseInt((leftBase ) - (leftAddion)) + 'px').css('right', 'none');
                    that.$this.find('.table_body').on('scroll', function () {
                        $columnDown.remove();
                    });
                };
                var column = $(this).parents('th').data('column');
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
                    var $columnDown = $('<ul class="column-down-menu"">' +
                        '<li class="sort sort-asc" data-sort="asc"><span class="menu-icon"><i class="fa fa-sort-amount-asc"></i></span><span>正序</span></li>' +
                        '<li class="sort sort-desc" data-sort="desc"><span class="menu-icon"><i class="fa fa-sort-amount-desc"></i></span><span>倒序</span></li>' +
                        '</ul>');
                    $columnDown.find('li.sort').on('click', function (e) {
                        var dataSort = this.dataset.sort;
                        var sortObj = {
                            field: filter.field,
                            direction: dataSort
                        };
                        if (filter.override) {
                            sortObj.override = filter.override;
                        }
                        var _sort = [sortObj];
                        var param = {
                            filter: that.$filter,
                            sort: _sort
                        };
                        that.loadBySubmit(param);
                    });
                    var filterValue = '';
                    if (filter && ((filter.type && filter.type == 'numeric') || (filter.type && filter.type == 'date'))) {
                        filterValue = {lt: '', gt: '', eq: ''}
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
                                    var _valList = _filter.value.split(',');
                                    for (var j = 0; j < _valList.length; j++) {
                                        var _vv = _valList[j];
                                        if (!isNaN(_vv)) {
                                            _valList[j] = parseFloat(_vv);
                                        }
                                    }
                                    filterValue = _valList;
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
                                $li.find('input').blur(function () {
                                    $li.find('input').val('');
                                });
                                $columnDown.append($li);
                            } else if (filter.type === 'date') {
                                var dateFmt = filter.dateFmt;
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
                                $li.find('input[name*=grid-filter]').datepicker({
                                    format: 'yyyy-mm-dd',
                                    // container: $(item).parent(),
                                    minView: 2
                                }).on('changeDate', function (ev) {
                                    var that = ev.currentTarget;
                                    var e = $.Event("keyup");
                                    e.keyCode = 13;
                                    $(that).trigger(e);
                                    // var e = $.Event("keyup");
                                    // e.keyCode = 13;
                                    // $(this).trigger(e);
                                    // $(that).datepicker('hide');
                                });
                                $columnDown.append($li);
                            } else if (filter.type === 'checkbox') {
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
                                            '<input class="checkbox-input" type="checkbox" name="grid-chb" ' + checked + ' value="' + storeitem.id + '"><label>' + (storeitem.text + ' ') + '</label>' +
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
                                            '<input class="checkbox-input radio-input" type="checkbox" name="grid-radio" ' + checked + ' value="' + storeitem.id + '"><label>' + (storeitem.text + ' ') + '</label>' +
                                            '</div></li>');
                                        $columnDown.append($li);
                                    }
                                }
                            }
                        } else {
                            $columnDown.append('<li><div class="input-group"> '
                                + '<span class="input-group-addon menu-icon"><i class="fa fa-filter"></i></span> '
                                + '<input type="text" class="form-control normal-search" autofocus placeholder="' + "回车过滤" + '" value="' + filterValue + '"> '
                                + '</div></li>');
                        }

                        if (filter.type === 'checkbox' || filter.type === 'radio') {
                            $columnDown.find('li input[type=checkbox]').on('click', function (e) {
                                e.stopPropagation();
                            });
                            $columnDown.find('li input[type=checkbox]').on('change', function (e) {
                                if (that.searched) {
                                    return false;
                                }
                                var name = this.name;
                                if ($(this).hasClass('radio-input')) {
                                    $columnDown.find('li input[name=' + name + ']').not($(this)).removeAttr('checked');
                                }
                                var ids = [];
                                $(this).parents('.column-filter').find('input[name=' + name + ']').each(function () {
                                    if (this.checked) {
                                        var _val = $(this).val();
                                        if (isNaN(_val)) {
                                            ids.push(_val);
                                        } else {
                                            ids.push(parseFloat(_val));
                                        }
                                    }
                                });
                                var _filter = $.extend(filter, {
                                    type: 'list',
                                    value: ids
                                });
                                this.searched = true;
                                that.loadBySubmit({pageNo: 1, filter: [_filter]});
                                e.stopPropagation();
                            });
                            $columnDown.find('li').click(function () {
                                $(this).find('input[type=checkbox]').click();
                            });
                        }

                        $columnDown.find('input[type*=text],input[type*=number]').keyup(function (e) {
                            if (e.keyCode === 13) {
                                if (that.searched) {
                                    return false;
                                }
                                if (filter.type === 'numeric' || filter.type === 'date') {
                                    filter.operator = $(this).data('operator');
                                }
                                filter.value = $(this).val();
                                var param = {
                                    pageNo: 1,
                                    filter: [filter]
                                };
                                that.searched = true;
                                that.loadBySubmit(param);
                            }
                            e.stopPropagation();
                        });
                    }
                    $(this).append($columnDown);
                    getLocation(this, $columnDown);
                }

            });
        }
        ,
        bindPageEvent: function () {
            var that = this;
            that.$this.find(".page-size").select2();
            that.$this.find(".page-size").change(function () {
                that.$page.pageSize = $(this).val();
                that.jumpPage(1, that.$page.totalPages);
            });
            var $page = that.$this.find('.grid-page');
            $page.find('.grid-page-prev').on('click', function () {
                that.jumpPage(that.$page.pageNo - 1, that.$page.totalPages);
            });

            $page.find('.grid-page-next').on('click', function () {
                that.jumpPage(that.$page.pageNo + 1, that.$page.totalPages);
            });

            $page.find('.grid-page-go').on('click', function () {
                var pageNo = $page.find('input.grid-go-no').val();
                that.jumpPage(pageNo, that.$page.totalPages);
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
            $('[data-grid-refresh]').click(function () {
                that.refresh();
            });
            var submit = function (_this) {
                var $that = $(_this);
                var key = $that.data('grid-search-key') || $that.attr('name');
                if (key) {
                    var val = $that.val() || $('[name=' + key + ']').val();
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
                    var form = $('form[name=' + formName + ']');
                    if (form && form.length > 0) {
                        that.loadWithOther(form.serializeArray().toModel());
                    }
                }
            };
            var $gridOn = $('[data-grid-on]');
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
            $('[data-grid-keydown]').on('keydown', function (e) {
                if (e.keyCode === 13) {
                    var formName = $(this).data('grid-search-form');
                    if (formName) {
                        submitForm(formName);
                    } else {
                        submit(this);
                    }
                }
            });

            $('[data-grid-search]').on('click', function () {
                var $that = $(this);
                var formName = $that.data('grid-search-form');
                submitForm(formName);
            });
        },
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

            that.$this.find('.table_head tr > th.td-check input').on('click', function (e) {
                var checked = this.checked;
                that.$this.find('table > tbody > tr > td.td-check input').each(function () {
                    this.checked = checked;
                    if (checked) {
                        $(this).parents('tr').addClass('grid-selected');
                    } else {
                        $(this).parents('tr').removeClass('grid-selected');
                    }
                });
                if (that.options.callback !== null) {
                    that.options.callback(false, false, that);
                }
                e.stopPropagation();
            });
            that.$this.find('.table_head tr > th.td-check').on('click', function () {
                $(this).find('input').click();
            });

            $tableBody.on('scroll', function (e) {
                var scrollLeft = $tableBody.scrollLeft();
                that.$this.find('.table_head').scrollLeft(scrollLeft);
            });

            window.addEventListener('resize', function () {
                that.setHeight(that.getModuleHeight() - that.options.height);
            });

        },
        initBodyEvent: function () {
            var that = this;
            that.$this.find('.table_body tr').on('click', function () {
                var inputElement = $(this).find('td input')[0];
                inputElement.checked = !(inputElement.checked);
                if (inputElement.checked) {
                    $(this).addClass('grid-selected');
                } else {
                    $(this).removeClass('grid-selected');
                }
                if (that.options.callback !== null) {
                    that.options.callback(inputElement, $(this).data(), that);
                }
            });
            that.$this.find('.table_body tr').dblclick(function () {
                if (that.options.doubleClick !== null) {
                    that.options.doubleClick($(this), $(this).data(), that);
                }
            });
            that.$this.find('.table_body tr td.td-check input').on('click', function (e) {
                var checked = this.checked;
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
        init: function (_$this, _options) {
            this.options = $.extend({}, this.getDefaultOption(), _options);

            this.$sort = [];
            this.$filter = [];
            this.$other = {};
            this.$page = {
                pageNo: this.options.page.pageNo,
                pageSize: this.options.page.pageSize
            };

            this.$this = _$this;
            _$this.append(this.html());

            this.$head = _$this.find('.grid-wrapper>.grid-content>div.table_head');
            this.$body = _$this.find('.grid-wrapper>.grid-content>div.table_body');

            this.$head.append('<table class="table"></table>');
            this.$body.append('<table class="table"></table>');

            this.header();
            this.body();

            if (this.options.height) {
                this.setHeight(this.getModuleHeight() - this.options.height);
            }

            var that = this;
            this.load(that.getDefaultParam(), function (page) {
                that.initEvent();
                that.page(page);
            });
        }
        ,
        header: function () {
            var $thead = $('<thead><tr><th class="td-check"><input type="checkbox" id="checkedIds" title=""></th></tr></thead>');
            var columns = this.options.columns;
            for (var i = 0; i < columns.length; i++) {
                var col = columns[i];
                var width = col.width ? col.width : 130;
                var colNameWidth = col.width ? (col.width - 50) : 80;
                var sort = (col.dataIndex && col.dataIndex !== '') ? ('<i class="fa fa-sort"></i>') : '';
                var filter = (col.dataIndex && col.dataIndex !== '') ? $('<div class="column-filter"><i class="fa fa-caret-down"></i></div>') : '';

                var $th = $(
                    '<th data-direction="default" class="column-th" data-column="' + col.dataIndex + '">\
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
                    $th.css('align', col.align);
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
        body: function () {

        },
        renderRow: function (row) {
            var $tr = $('<tr data-id="' + row[this.options.idField] + '"><td class="td-check" align="center"><input type="checkbox" name="checkedIds" value="' + row[this.options.idField] + '" title=""></td></tr>');
            $tr.data(row);
            var columns = this.options.columns;
            for (var i = 0; i < columns.length; i++) {
                var col = columns[i];
                var width = col.width ? col.width : 130;
                var data = row[col.dataIndex] || '';
                if (col.renderer) {
                    data = col.renderer(data, row, i, col);
                }
                var $td = $(
                    '<td data-column="' + col.dataIndex + '"> </td>'
                );
                $td.append(data);
                $td.css({
                    'width': width,
                    'min-width': width,
                    'max-width': width
                });
                if (col.align && col.align !== '') {
                    $td.css('align', col.align);
                }
                $tr.append($td);
            }
            return $tr;
        },
        load: function (_param, callback) {
            if (this.options.beforeLoad) {
                this.options.beforeLoad(_param);
            }
            var that = this;
            var error0 = function (errMsg) {
                if (errMsg) {
                    $.tip.error(errMsg);
                }
                that.sorted = false;
                that.searched = false;
                that.$this.find('tbody').empty();
                console.log(that.$this.find('.table_body').find('div.grid-not-data'))
                that.$this.find('.table_body').append(that.noData());
                that.$this.find('.table_body table').show();
                that.$this.find('.grid-loading').hide();
            };

            that.$this.find('.table_body').find('div.grid-not-data').remove();
            that.$this.find('tbody').remove();
            that.$this.find('.grid-loading').show();
            $.ajax({
                type: 'POST',
                url: that.options.url,
                async: that.options.async,
                data: JSON.stringify(_param),
                contentType: "application/json",
                dataType: 'json',
                success: function (res) {
                    if (res && typeof res === 'object') {
                        var page = res.page;
                        if (page && page.result && page.result.length > 0) {

                            var $tbody = $('<tbody></tbody>');
                            for (var i = 0; i < page.result.length; i++) {
                                $tbody.append(that.renderRow(page.result[i]));
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

                                that.$this.find('.table_body table').show();
                                that.$this.find('.grid-loading').hide();
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

            });
        },
        page: function (page) {
            if (this.options.enablePage) {
                var totalPages = (page.totalItems % page.pageSize === 0) ? (page.totalItems / page.pageSize) : (Math.floor(page.totalItems / page.pageSize) + 1);
                this.$page = page = $.extend(page, {
                    totalPages: totalPages,
                    hasPrePage: page.pageNo - 1 > 0,
                    hasNextPage: page.pageNo + 1 <= totalPages
                });
                var $left = $('<div class="col-xs-4">\
                    <span style="padding-left: 10px;">共' + page.totalItems + '条记录，每页</span>\
                    <select class="page-size" style="width: 70px;">\
                        <option value="20">20</option>\
                        <option value="40">40</option>\
                        <option value="60">60</option>\
                        <option value="80">80</option>\
                        <option value="100">100</option>\
                    </select>\
                    <span>条记录</span>\
                </div>');
                $left.find('.page-size').val(page.pageSize);
                var prevPage = page.hasPrePage ? ('<span class="link grid-page-prev">上一页</span>') : ('<span> 上一页 </span>');
                var nextPage = page.hasNextPage ? ('<span class="link grid-page-next">下一页</span>') : ('<span> 下一页 </span>');
                var right = '<div class="col-xs-8">\
                    <div class="col-xs-12">\
                        <div class="pull-right">\
                        ' + prevPage + '\
                        ' + nextPage + '\
                        转到&nbsp;<input type="text" class="grid-go-no form-control input-sm" style="display: inline-block; width: 40px;" value="' + page.pageNo + '" title="页数">\
                        <button type="button" class="grid-page-go btn btn-primary btn-sm">\
                        GO\
                        </button>\
                        </div>\
                    </div>\
                </div>';
                this.$this.find('.grid-page').empty().append($left).append(right);
                this.bindPageEvent();
            } else {
                this.$this.find('.grid-page').remove();
            }
        },
        html: function () {
            return ('' +
            '<div class="grid-wrapper">' +
            '   <div class="grid-content">' +
            '       <div class="table_head"></div>' +
            '       <div class="table_body">' +
            '       <div align="center" class="grid-loading" style="display: none; position: absolute;top: 10px;left: 47%;">' +
            '           <i class="fa fa-spinner fa-spin" style="font-size:34px; margin: 50px 20px; color: black"></i>' +
            '       </div>' +
            '       </div>' +
            '       <div class="grid-page row"></div>' +
            '   </div>' +
            '</div>');
        },
        noData: function () {
            return (
                '<div class="grid-not-data">' +
                '    <img src="/app/img/data-null.png" width="180" height="120">' +
                '</div>'
            );
        }

    };
    $.fn.jq_grid = function (_options) {
        var that = this;
        return new Grid(that, _options);
    };

})(jQuery);
