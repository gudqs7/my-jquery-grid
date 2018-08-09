package com.guddqs.grid.example;

import com.guddqs.grid.support.pojo.AbstractPage;
import com.guddqs.grid.support.pojo.FilterVo;
import com.guddqs.grid.support.pojo.ParamVo;
import com.guddqs.grid.support.pojo.SortVo;

import java.util.List;

/**
 * @author wq
 * @date 2018/8/9
 */
public class YourBaseServiceImpl<T> implements IYourBaseService<T> {

    @Override
    public AbstractPage<T> findAll(ParamVo<T> paramVo) throws Exception {

        // you can get any thing from paramVo
        if (paramVo.getSort() != null && paramVo.getSort().size() > 0) {
            for (SortVo sortVo : paramVo.getSort()) {
                if (Strings.isEmpty(sortVo.getDirection()) || Strings.isEmpty(sortVo.getField())) {
                    continue;
                }
                if (SortVo.DESC.equalsIgnoreCase(sortVo.getDirection())) {
                    if (!Strings.isEmpty(sortVo.getOverride())) {
                        // code for make query sort by field with override (desc)
                    } else {
                        // code for make query sort by field (desc)
                    }
                } else {
                    if (!Strings.isEmpty(sortVo.getOverride())) {
                        // code for make query sort by field with override (asc)
                    } else {
                        // code for make query sort by field  (asc)
                    }
                }
            }
        }
        if (paramVo.getFilter() != null && paramVo.getFilter().size() > 0) {
            for (FilterVo filterVo : paramVo.getFilter()) {
                if (filterVo == null ||
                        filterVo.getRight() == 0 ||
                        Strings.isEmpty(filterVo.getField()) ||
                        Strings.isEmpty(filterVo.getOperator()) ||
                        Strings.isEmpty(filterVo.getValue0().toString())) {
                    continue;
                }
                if (!Strings.isEmpty(filterVo.getOverride())) {
                    // code for add a filter for query with the field override by use operator and value0
                    //condition.where().and(filterVo.getOverride(), filterVo.getOperator(), filterVo.getValue0());
                } else {
                    // code for add a filter for query with the field by use operator and value0
                    //condition.where().and(filterVo.getField(), filterVo.getOperator(), filterVo.getValue0());
                }
            }
        }

        // also, you can get page from here
        int start = (paramVo.getPageNo() - 1) * paramVo.getPageSize();
        int limit = paramVo.getPageSize();

        return null;
    }

    @Override
    public List<T> findAll() throws Exception {
        return null;
    }

    @Override
    public T insert(T t) throws Exception {
        return null;
    }
}
