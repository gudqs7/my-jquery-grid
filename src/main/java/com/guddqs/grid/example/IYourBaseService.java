package com.guddqs.grid.example;

import com.guddqs.grid.support.service.IGridService;

import java.util.List;

/**
 * @author wq
 * @date 2018/8/9
 */
public interface IYourBaseService<T> extends IGridService<T> {

    /**
     * example for you base service method
     *
     * @return result of all
     * @throws Exception could be happened
     */
    List<T> findAll() throws Exception;

    /**
     * example for you base service method
     *
     * @param t entity
     * @return entity back
     * @throws Exception could be happened
     */
    T insert(T t) throws Exception;

}
