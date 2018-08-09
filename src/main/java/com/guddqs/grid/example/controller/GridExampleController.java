package com.guddqs.grid.example.controller;

import com.guddqs.grid.example.UserExampleEntity;
import com.guddqs.grid.example.service.IGridExampleService;
import com.guddqs.grid.support.pojo.AbstractPage;
import com.guddqs.grid.support.pojo.ParamVo;

/**
 * @author wq
 * @date 2018/8/9
 */
public class GridExampleController {

    /**
     * struts2
     */
    private ParamVo<UserExampleEntity> paramVoStruts2;

    private IGridExampleService gridExampleService;

    /**
     * controller or action method, if struts2, use paramVoStruts2, or paramVo
     *
     * @param paramVo grid param
     * @throws Exception could be happened
     */
    public void findAll(ParamVo<UserExampleEntity> paramVo) throws Exception {

        AbstractPage<UserExampleEntity> userExamplePage = gridExampleService.findAll(paramVo);

        // let page back, with json format {"code": 200, "page": userExamplePage, "message": "ok"} or {"success": true, "page": userExamplePage, "msg": "ok"}
        // any way , we just worry about page given or not
    }

}
