import { observable, action } from 'mobx';

import { queryTree, queryList, insert, remove, queryDetail, update } from '@/services/SystemManagement/menu';
import { queryTree as queryCodeTree } from '@/services/SystemManagement/Code';
import { queryMenuButton, queryMenuList } from '@/services/global';

class MenuStore {
  // 鉴权菜单按钮
  @observable authMenuListButton;
  @observable authMenuFormButton;
  // 鉴权列表
  @observable authMenuListField;

  // 树结构数据
  @observable treeList; 
  // 当前选中的树节点id
  @observable selectedKeys; 

  // 列表数据
  @observable list; 
  // 控制列表是否显示加载中
  @observable loading; 
  // 列表分页数据
  // @observable pagination;
  // 被选择行的行标识
  @observable selectedRowKeys;
  // table 排序字段
  @observable orderField;
  // 是否降序
  @observable isDesc;
  // 当前要操作的数据详情
  @observable currentDetail;
  
  // currentForm 的默认值，用于 clear 时的数据
  defaultCurrentForm = {
    IsDisplayed: {
      value: 1,
    },
  };
  // 当前正在编辑的节点，属性为对象，包涵错误信息等，eg: {Name: {value: 'test'}},
  @observable currentForm;
  // 代码节点选择下拉框数据
  @observable codeTreeList;
  // 新建按钮的是否显示加载中
  @observable newBtnLoading;

  /**
   * 含有接口请求等异步操作的 action
   */
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
      this.setCurrentFormField({
        UniqueID: {
          name: 'UniqueID', 
          value: response.Data,
        },
      })
    }

    this.setData({
      newBtnLoading: false,
    });

    if(response.Code === 200) {
      this.refreshList();
      this.fetchTree();
    } else {
      return await Promise.reject(response.Error);
    }
  }

  @action
  async remove(data) {
    const response = await remove(data);
    if(response.Code === 200) {
      this.refreshList();
      this.fetchTree();
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

  // 查询树的数据
  @action
  async fetchTree() {
    const response = await queryTree();
    if (response.Code === 200) {
      this.setData({
        treeList: this.formatMenuTree(response.Data),
      });
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
      ParentID: this.selectedKeys[0],
      // CurrentPage: this.pagination.current,
      // PageSize: this.pagination.pageSize,
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
        // pagination: {
        //   ...this.pagination,
        //   total: response.TotalCount
        // },
      });
    }

    this.setData({
      loading: false,
    });
  }

  
  // 查询树的数据
  @action
  async fetchCodeTree() {
    const response = await queryCodeTree();
    if (response.Code === 200) {
      this.setData({
        codeTreeList: this.formatCodeTree(response.Data),
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
    
    // 树结构数据
    this.treeList = []; 
    // 当前选中的树节点id
    this.selectedKeys = ['0']; 

    // 列表数据
    this.list = []; 
    // 控制列表是否显示加载中
    this.loading = false; 
    // 列表分页数据
    // this.pagination = {
    //   current: 1,
    //   pageSize: 200,
    //   total: 0, // 总数,由接口提供
    // };
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
    // 代码节点选择下拉框数据
    this.codeTreeList = [];
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
    const form = {};
    // 将数据格式化，以适应组件
    Object.keys(data).forEach((key) => {
      if(key === 'EntryIDValue') {
        form[key] = {
          name: key, 
          value: {
            value: data[key],
            label: data.Name,
          },
        };
      } else {
        form[key] = {
          name: key, 
          value: data[key],
        };
      }
    });

    this.currentForm = form;
  }

  // 格式化菜单树
  formatMenuTree(tree) {
    return tree
    //.filter(item => item.category !== 2) // 树不显示类型为栏目（2）的项
    .map(item => {
      if(item.hasChildren && item.children && item.children.length > 0) {
        return {
          ...item,
          children: this.formatMenuTree(item.children),
        };
      } else {
        return item;
      }
    })
  }

  // 格式化菜单树
  formatCodeTree(tree) {
    return tree
    .filter(item => item.category !== 2) // 树不显示类型为代码（2）的项
    .map(item => {
      const result = {
        ...item,
        value: item.id,
        key: item.id,
        label: item.name,
      };
      if(item.hasChildren && item.children && item.children.length > 0) {
        result.children = this.formatCodeTree(item.children);
      }
      return result;
    })
  }
}

export default new MenuStore();
