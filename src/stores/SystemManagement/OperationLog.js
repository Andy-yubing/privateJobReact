import { observable, action } from 'mobx';

import { queryList, remove, queryOperateType } from '@/services/SystemManagement/OperationLog';
import { queryMenuButton, queryMenuList } from '@/services/global';

class OperationLogStore {
  // 鉴权菜单按钮
  @observable authMenuListButton;
  @observable authMenuFormButton;
  // 鉴权列表
  @observable authMenuListField;

  // 列表数据
  @observable list;
  // 控制列表是否显示加载中
  @observable loading; 
  // 列表分页数据
  @observable pagination;
  // table 排序字段
  @observable orderField;
  // 是否降序
  @observable isDesc;
  // 被选择行的行标识
  @observable selectedRowKeys;

  // 查询表单数据，在查询时赋值
  @observable searchFormValues;
  // 操作类型下拉框数据
  @observable operateTypeTextValue;


  @action
  async fetchAuthMenuListButton(data) {
    const response = await queryMenuButton({
      Category: 1,
    });
    if(response.Code === 200) {
      this.setData({
        authMenuListButton: response.Data,
      });
    }
  }

  @action
  async fetchAuthMenuFormButton(data) {
    const response = await queryMenuButton({
      Category: 2,
    });
    if(response.Code === 200) {
      this.setData({
        authMenuFormButton: response.Data,
      });
    }
  }

  @action
  async fetchAuthMenuListField(data) {
    const response = await queryMenuList();
    if(response.Code === 200) {
      let defField= response.Data.find((value, index, arr) => {
        return value.IsSortFields=== 1;
       });
       let _orderField=null,_isDesc=false;
       if(defField)
       {
          _orderField=defField.SerialNumber;
          _isDesc=defField.DefaultSortingMethod===2;
       }
      this.setData({
        authMenuListField: response.Data,
        orderField:_orderField,
        isDesc:_isDesc,
      });
    }
  }

  /**
   * 含有接口请求等异步操作的 action
   */
  @action
  async remove(data) {
    const response = await remove(data);
    if(response.Code === 200) {
      this.refreshList();
    } else {
      return await Promise.reject(response.Error);
    }
  }

  // 使用当前状态刷新列表
  @action
  async refreshList() {
    let orderData = {};
    if(this.orderField) {
      orderData = {
        OrderField: this.orderField,
        IsDesc: this.isDesc,
      }
    }
    
    this.fetchList({
      CurrentPage: this.pagination.current,
      PageSize: this.pagination.pageSize,
      ...this.searchFormValues,
      ...orderData,
    });
  }

  @action
  async fetchList(data) {
    this.setData({
      loading: true,
    });

    const response = await queryList(data);

    if (response.Code === 200) {
      this.setData({
        list: response.Data,
        pagination: {
          ...this.pagination,
          total: response.TotalCount,
        },
      });
    }

    this.setData({
      loading: false,
    });
  }

  @action
  async fetchOperateTypeTextValue() {
    const response = await queryOperateType();

    if(response.Code === 200) {
      this.setData({
        operateTypeTextValue: response.Data,
      });
    }
  }

  /**
   * 不含异步操作的 action
   */
  @action
  setData(data) {
    Object.keys(data).forEach((key) => {
      this[key] = data[key];
    });
  }
  // 用于初始化和切换页面时清空数据
  @action
  reset() {
    // 鉴权菜单按钮
    this.authMenuListButton = [];
    this.authMenuFormButton = [];
    // 鉴权列表
    this.authMenuListField = [];
    
    // 列表数据
    this.list = [];
    // 控制列表是否显示加载中
    this.loading = false; 
    // 列表分页数据
    this.pagination = {
      current: 1,
      pageSize: 20,
      total: 0, // 总数,由接口提供
    };
    // table 排序字段
    this.orderField = null;
    // 是否降序
    this.isDesc = false;
    // 被选择行的行标识
    this.selectedRowKeys = [];

    // 查询表单数据，在查询时赋值
    this.searchFormValues = {};
    // 操作类型下拉框数据
    this.operateTypeTextValue = [];
  }
}

export default new OperationLogStore();
