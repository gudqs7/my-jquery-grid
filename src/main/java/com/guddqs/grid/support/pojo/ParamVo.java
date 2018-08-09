package com.guddqs.grid.support.pojo;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author wq
 * @date 2018/5/10
 */
public class ParamVo<T> {

    private Integer pageNo = 1;
    private Integer pageSize = 20;
    private List<FilterVo> filter = new ArrayList<>();
    private List<SortVo> sort = new ArrayList<>();
    private Map<String, Object> other = new ConcurrentHashMap<>();

    public ParamVo() {
    }

    public ParamVo(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public Map<String, Object> getOther() {
        return other;
    }

    public void setOther(Map<String, Object> other) {
        this.other = other;
    }

    public Integer getPageNo() {
        return pageNo;
    }

    public void setPageNo(Integer pageNo) {
        this.pageNo = pageNo;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public List<FilterVo> getFilter() {
        return filter;
    }

    public void setFilter(List<FilterVo> filter) {
        for (FilterVo filterVo : filter) {
            String type = filterVo.getType();
            Object value = filterVo.getValue();
            if (type != null && !"".equals(type.trim())) {
                filterVo.setRight(0);
                continue;
            }
            if (FilterVo.Type.STRING.equals(type)) {
                filterVo.setOperator(" like ");
                filterVo.setValue0("%" + value + "%");
                filterVo.setRight(1);
            }
            if (FilterVo.Type.NUMERIC.equals(type) || FilterVo.Type.DATE.equals(type)) {
                String comparison = filterVo.getOperator();
                if (FilterVo.Comparison.LESS_THEN.equals(comparison)) {
                    filterVo.setOperator(" < ");
                }
                if (FilterVo.Comparison.GREAT_THEN.equals(comparison)) {
                    filterVo.setOperator(" > ");
                }
                if (FilterVo.Comparison.LESS_AND_EQUALS.equals(comparison)) {
                    filterVo.setOperator(" <= ");
                }
                if (FilterVo.Comparison.GREAT_AND_EQUALS.equals(comparison)) {
                    filterVo.setOperator(" >= ");
                }
                if (FilterVo.Comparison.EQUALS.equals(comparison)) {
                    filterVo.setOperator(" = ");
                }
                filterVo.setRight(1);
            }
            if (FilterVo.Type.DATE.equals(type)) {
                filterVo.setRight(1);
            }
            if (FilterVo.Type.LIST.equals(type)) {
                filterVo.setOperator(" in ");
                StringBuilder sbValue = new StringBuilder();
                if (filterVo.getValue() != null) {
                    if (filterVo.getValue() instanceof List) {
                        List valList = (List) filterVo.getValue();
                        for (int j = 0; j < valList.size(); j++) {
                            Object val = valList.get(j);
                            if (val instanceof Integer || val instanceof Float || val instanceof Double) {
                                sbValue.append(val.toString());
                            } else {
                                sbValue.append("'");
                                sbValue.append(val.toString());
                                sbValue.append("'");
                            }
                            if (j < valList.size() - 1) {
                                sbValue.append(",");
                            }
                        }
                        filterVo.setValue(sbValue.toString());
                    }
                    filterVo.setRight(1);
                }
            }

        }
        this.filter = filter;
    }

    public List<SortVo> getSort() {
        return sort;
    }

    public void setSort(List<SortVo> sort) {
        this.sort = sort;
    }
}
