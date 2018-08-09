package com.guddqs.grid.support.pojo;

import java.util.ArrayList;
import java.util.List;

/**
 * @author wq
 * @date 2018/8/9
 */
public abstract class AbstractPage<T> {

    private static final String ASC = "asc";
    private static final String DESC = "desc";

    private int pageNo = 1;
    private int pageSize = -1;
    private List<T> result = new ArrayList<T>();
    private long totalItems = -1;

    public AbstractPage() {
    }

    public AbstractPage(int pageSize) {
        setPageSize(pageSize);
    }

    public AbstractPage(int pageNo, int pageSize) {
        setPageNo(pageNo);
        setPageSize(pageSize);
    }

    public int getPageNo() {
        return pageNo;
    }

    public void setPageNo(final int pageNo) {
        this.pageNo = pageNo;

        if (pageNo < 1) {
            this.pageNo = 1;
        }
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(final int pageSize) {
        this.pageSize = pageSize;
    }

    public int getOffset() {
        return ((pageNo - 1) * pageSize);
    }

    public List<T> getResult() {
        return result;
    }

    public void setResult(final List<T> result) {
        this.result = result;
    }

    public long getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(final long totalItems) {
        this.totalItems = totalItems;
    }

    protected long getTotalPages() {
        if (totalItems < 0) {
            return -1;
        }

        long count = totalItems / pageSize;
        if (totalItems % pageSize > 0) {
            count++;
        }
        return count;
    }


}
