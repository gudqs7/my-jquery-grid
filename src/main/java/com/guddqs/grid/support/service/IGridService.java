package com.guddqs.grid.support.service;

import com.guddqs.grid.support.pojo.AbstractPage;
import com.guddqs.grid.support.pojo.ParamVo;

/**
 * @author wq
 * @date 2018/8/9
 */
public interface IGridService<T> {

    /**
     * 查询 paramVo 方式
     *
     * @param paramVo 分页 及 条件对象
     * @return 查询结果
     * @throws Exception 异常外抛
     */
    AbstractPage<T> findAll(ParamVo<T> paramVo) throws Exception;

}
