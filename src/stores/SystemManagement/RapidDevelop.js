import { observable, action, computed } from 'mobx';

import { queryDbList, queryTVList, queryFieldList , queryMenuTree , generateCode } from '@/services/SystemManagement/RapidDevelop';

class RapidDevelopStore {
  // 列表数据
  @observable TVList;
  // 控制列表是否显示加载中
  @observable loading; 
  // 被选择行的行标识
  @observable selectedRowKeys;
  // 数据库列表，用于选择数据库下拉框
  @observable dbList;
  // 已加载字段列表的行
  @observable loadedFieldListRowsSet;
  // 查询数据
  @observable TVListSearchField;
  // 展开的行
  @observable expandedRowKeys;

  @observable tempDBSettingData;

  // 基本配置表单数据
  @observable baseConfigForm;
  //临时保存的基本配置数据
  @observable tempBaseConfigData;
  //功能名称下拉数据
  @observable functionMenuTree;
  
  //选中表的字段变更后的结果集
  @observable selectedFieldList;


  
   /**
   * 含有接口请求等异步操作的 action
   */
  @action
  async fetchTVList(data) {
    this.setData({
      loading: true,
    });

    const response = await queryTVList(data);

    if (response.Code === 200) {

      this.setData({
        TVList: response.Data,
        expandedRowKeys: [],
        loadedFieldListRowsSet: new Set(),
        tempDBSettingData:data,
      });
    }

    this.setData({
      loading: false,
    });
  }

  @action
  async fetchDbList(data) {
    this.setData({
      loading: true,
    });

    const response = await queryDbList(data);
    
    if (response.Code === 200) {
      this.setData({
        dbList: response.Data,
      });
    }

    this.setData({
      loading: false,
    });
  }

  @action
  async fetchFieldList(data) {
    this.setData({
      loading: true,
    });

    if(data.fieldList){
      delete data.fieldList;
    }

    const response = await queryFieldList(data);

    if (response.Code === 200) {
      this.setData({
        TVList: this.TVList.map(item => {
          if(item.UniqueID === data.UniqueID) {
            return {
              ...item,
              fieldList: response.Data,
            };
          } else {
            return item;
          }
        }),
        loadedFieldListRowsSet: this.loadedFieldListRowsSet.add(data.UniqueID),
      });
    }

    this.setData({
      loading: false,
    });
  }

  @action
  async fetchFunctionMenuData(data){
    const response = await queryMenuTree(data);
    if(response.Code===200){
      // console.log('test',this.formatMenuTree(response.Data));
      this.setData({
        functionMenuTree:this.formatMenuTree(response.Data),
      });
    }
  }

  //提交生成代码
  @action
  async submitGenerateCode(data){
    const response = await generateCode(data);
    if(response.Code!==200){
      return await Promise.reject(response.Error);
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

  @action
  setTVListSearchField(data) {
    this.TVListSearchField = {
      ...this.TVListSearchField,
      ...data,
    }
  }
  @action
  setBaseConfigFormField(data) {
    this.baseConfigForm = {
      ...this.baseConfigForm,
      ...data,
    }
  }

  @action
  setBaseConfigForm(data) {
    // 将数据格式化，以适应组件
    Object.keys(data).forEach((key) => {
      data[key] = {
        name: key, 
        value: data[key],
      };
    });

    this.baseConfigForm = {
      ...this.baseConfigForm,
      ...data,
    };
  }

  @action
  setFieldValue(data){
    this.setData({
      selectedFieldList: this.selectedFieldList.map(item=>{
        if( item.UniqueID === data.UniqueID) {
          return data;
        } else {
          return item;
        }
      })
    }); 
  }

  // 用于初始化和切换页面时清空数据
  @action
  reset() {
    // 列表数据
    this.TVList = [];
    // 控制列表是否显示加载中
    this.loading = false; 
    // 被选择行的行标识
    this.selectedRowKeys = [];
    // 数据库列表，用于选择数据库下拉框
    this.dbList = [];
    // 已加载字段列表的行
    this.loadedFieldListRowsSet = new Set();
    // 查询数据
    this.TVListSearchField = {};
    // 展开的行
    this.expandedRowKeys = [];

    // 基本配置表单数据
    this.baseConfigForm = {};
    //功能名称下拉数据
    this.functionMenuTree = [];

    this.selectedFieldList = [];
  }

  @computed
  get selectedRow() {
    return this.TVList.filter(item => ( this.selectedRowKeys.indexOf(item.UniqueID) !==-1));
  }

  
  // 格式化菜单树
  formatMenuTree(tree) {
    return tree
    //.filter(item => item.category !== 2) // 树不显示类型为代码（2）的项
    .map(item => {
      const result = {
        ...item,
        value: item.id,
        key: item.id,
        label: item.name,
        disabled: (item.category!==2)?true:false,
      };
      if(item.hasChildren && item.children && item.children.length > 0) {
        result.children = this.formatMenuTree(item.children);
      }
      return result;
    })
  }
} 

export default new RapidDevelopStore();

