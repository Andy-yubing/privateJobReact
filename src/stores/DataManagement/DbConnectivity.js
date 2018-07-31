import { observable, action } from 'mobx';

import { insert, update, remove, queryList, queryDetail, testList, testForm, download } from '@/services/DataManagement/DbConnectivity';
import { queryMenuButton, queryMenuList } from '@/services/global';

class DbConnectivityStore {
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
/** 不分页注释掉 ***********************************************************************************/
  // @observable pagination;
/** 不分页注释掉 ***********************************************************************************/
  // 被选择行的行标识
  @observable selectedRowKeys;
  // table 排序字段
  @observable orderField;
  // 是否降序
  @observable isDesc;
  // 当前要操作的数据详情
  @observable currentDetail;

  // currentForm 的默认值，用于 clear 时的数据
  defaultCurrentForm = {};
  // 当前正在编辑的节点，属性为对象，包涵错误信息等，eg: {Name: {value: 'test'}},
  @observable currentForm;
  // 新建按钮的是否显示加载中
  @observable newBtnLoading;


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
      this.setData({
        authMenuListField: response.Data,
      });
    }
  }

   /**
   * 含有接口请求等异步操作的 action
   */
  @action
  async commit(data) {

    this.setData({
      newBtnLoading: true,
      error: null,
    });

    let response = null;

    // 当有 id 时为编辑，否则为新建
    if(data.UniqueID) {
      response = await update(data);
    } else {
      response = await insert(data);
    }

    this.setData({
      newBtnLoading: false,
    });

    if(response.Code === 200) {
      this.refreshList();
    } else {
      return await Promise.reject(response.Error);
    }
  }

  @action
  async remove(data) {
    const response = await remove(data);
    if(response.Code === 200) {
      this.refreshList();
    } else {
      return await Promise.reject(response.Error);
    }
  }

  @action
  async fetchDetail() {

    const response = await queryDetail({
      UniqueID: this.selectedRowKeys[0],
    });

    if (response.Code === 200) {
      this.setData({
        currentDetail: response.Data,
      });
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
/** 不分页注释掉 ***********************************************************************************/
      // CurrentPage: this.pagination.current,
      // PageSize: this.pagination.pageSize,
/** 不分页注释掉 ***********************************************************************************/
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
        // total 来自接口返回
/** 不分页注释掉 ***********************************************************************************/
        // pagination: {
        //   ...this.pagination,
        //   total: response.TotalCount
        // },
/** 不分页注释掉 ***********************************************************************************/
      });
    }

    this.setData({
      loading: false,
    });
  }

  @action
  async testList(data) {
    const response = await testList(data);
    if(response.Code !== 200) {
      return await Promise.reject(response.Error);
    }
  }

  @action
  async testForm(data) {
    const response = await testForm(data);
    if(response.Code !== 200) {
      return await Promise.reject(response.Error);
    }
  }

  @action
  async download(data) {
    await download(data);
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
/** 不分页注释掉 ***********************************************************************************/
    // this.pagination = {
    //   current: 1,
    //   pageSize: 20,
    //   total: 0, // 总数,由接口提供
    // };
/** 不分页注释掉 ***********************************************************************************/
    // 被选择行的行标识
    this.selectedRowKeys = [];
    // table 排序字段
    this.orderField = null;
    // 是否降序
    this.isDesc = false;
    // 当前要操作的数据详情
    this.currentDetail = null;

    // 当前正在编辑的节点，属性为对象，包涵错误信息等，eg: {Name: {value: 'test'}},
    this.currentForm = this.defaultCurrentForm;
    // 新建按钮的是否显示加载中
    this.newBtnLoading = false;
  }

  @action
  clearCurrentForm() {
    this.currentForm = this.defaultCurrentForm;
    this.error = null;
  }
  @action
  setCurrentFormField(data) {
    this.currentForm = {
      ...this.currentForm,
      ...data,
    }
  }
  @action
  setCurrentForm(data) {
    // 将数据格式化，以适应组件
    Object.keys(data).forEach((key) => {
      data[key] = {
        name: key, 
        value: data[key],
      };
    });

    this.currentForm = data;
  }
} 

export default new DbConnectivityStore();

