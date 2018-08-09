package com.guddqs.grid.support.pojo;

/**
 * @author wq
 * @date 2018/5/10
 */
public class FilterVo {
    
    public interface Type {
        String STRING = "string";
        String NUMERIC = "numeric";
        String DATE = "date";
        String LIST = "list";
    }

    public interface Comparison {
        String LESS_THEN = "lt";
        String GREAT_THEN = "gt";
        String LESS_AND_EQUALS = "le";
        String GREAT_AND_EQUALS = "ge";
        String EQUALS = "eq";
    }

    private String field;
    private String override;

    private String operator;

    private Object value;
    private Object value0;

    private String type;

    private int right;

    public String getOverride() {
        return override;
    }

    public void setOverride(String override) {
        this.override = override;
    }

    public int getRight() {
        return right;
    }

    public void setRight(int right) {
        this.right = right;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
        this.value0 = value;
    }

    public Object getValue0() {
        return value0;
    }

    public void setValue0(Object value0) {
        this.value0 = value0;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
