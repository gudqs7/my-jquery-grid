package com.guddqs.grid.support.pojo;

/**
 * @author wq
 * @date 2018/5/10
 */
public class SortVo {

    public final static String DESC = "desc";

    private String field;
    private String direction;
    private String override;

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public String getOverride() {
        return override;
    }

    public void setOverride(String override) {
        this.override = override;
    }

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }
}
