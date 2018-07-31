import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Layout, Table, Modal, message, Alert } from 'antd';

import DisplayTree from '@/components/DisplayTree';
import ModalUpload from '@/components/ModalUpload'
import DiagnosticPlatformForm from './form';
import DiagnosticPlatformToolBar from './toolBar';
import styles from './index.less';


const { Sider , Content } = Layout;
const { confirm } = Modal;
const api = window.PUBLIC_ENV_CONFIG.API;

//全局配置message的显示位置、时长、最大显示数
message.config({
  top: 240,//消息距离顶部的位置
  duration: 3,//默认自动关闭延时，单位秒
  maxCount: 3,//最大显示数, 超过限制时，最早的消息会被自动关闭
});


@inject('DiagnosticPlatform')
@observer
export default class DiagnosticPlatform extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expandedKeys: ['0'],
      Calculate_Modalvisible:false,
      modalVisible: false,
      modalUploadProps:{
        title:'导入组件',
        closable:false,
        maskClosable:false,
        visible:false,
        action:'',
        multiple:true,
        accept:'application/excel,application/vnd.ms-excel,application/x-excel,application/x-msexcel',
        handleChangeModalUpload:this.handleChangeModalUpload.bind(this),
      },
    }
  }

  handleChangeModalUpload(visible){
    this.setState(({modalUploadProps }) => {
      modalUploadProps.visible=visible;
      return {
        modalUploadProps,
      };
    });
  }

  componentWillMount() {
    const { DiagnosticPlatform } = this.props;
    DiagnosticPlatform.reset();
  }
  
  componentDidMount() {
    const { DiagnosticPlatform } = this.props;
    DiagnosticPlatform.fetchAuthMenuListButton();
    DiagnosticPlatform.fetchAuthMenuFormButton();
    DiagnosticPlatform.fetchAuthMenuListField();
    DiagnosticPlatform.fetchTree({
      ParentID: 0,
    });
    DiagnosticPlatform.refreshList();
  }

  componentWillUnmount() {
    const { DiagnosticPlatform } = this.props;
    DiagnosticPlatform.reset();
  }


  // 设置模态框显示/隐藏
  setModalVisible = (modalVisible) => {
    this.setState({
      modalVisible,
    });
  }

  //设置计算关联模态框的显示/隐藏
  setCalculate_ModalVisible=(Calculate_Modalvisible)=>{
    this.setState({
        Calculate_Modalvisible,
    });
}

  // 新建
  handleNew = () => {
    this.setModalVisible(true);
  }

  // 修改
  handleEdit = () => {
    const { DiagnosticPlatform } = this.props;

    DiagnosticPlatform.fetchDetail().then(() => {
      DiagnosticPlatform.setCurrentForm(DiagnosticPlatform.currentDetail);
      this.setModalVisible(true);
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }
  
  // 清空选中条目
  cleanSelectedKeys = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { DiagnosticPlatform } = this.props;

    DiagnosticPlatform.setData({
      selectedRowKeys: [],
    });
  }

  // 批量删除选中条目
  handleRemoveChecked = () => {

    const { DiagnosticPlatform } = this.props;
    
    confirm({
      title: `确认要删除这 ${DiagnosticPlatform.selectedRowKeys.length} 条记录吗?`,
      content: '',
      onOk: () => {
        this.handleRemove(DiagnosticPlatform.selectedRowKeys);
      },
    });
  }

  // 删除
  handleRemove = (Params) => {
    const { DiagnosticPlatform } = this.props;

    DiagnosticPlatform.remove({
      Params,
    }).then(() => {
      message.success('删除成功');
      // 在选中条目中清除已经删除的
      DiagnosticPlatform.setData({
        selectedRowKeys: DiagnosticPlatform.selectedRowKeys.filter(item => (Params.indexOf(item) === -1)),
      });
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }
  //树形菜单点击树节点触发
  onSelect=(selectedKeys, info)=>{
    this.setState(({expandedKeys})=>{
      let key;
      if(selectedKeys.length===0){
        key=info.node.props.eventKey
      }
      else{
        key=selectedKeys[0];
      }
      let index=expandedKeys.indexOf(key);
      if(index>-1){
        expandedKeys.splice(index,1);
      }
      else{
        expandedKeys.push(key);
      }

      return{
        expandedKeys,
      };
    });
  }
  //展开/收起节点时触发
  onExpand=(expandedKeys, info)=>{
    this.setState({
      expandedKeys,
    });
  }
  // 表格分页、排序等的回调函数
  handleTableChange = (pagination, filters, sorter) => {
    const { DiagnosticPlatform } = this.props;

    // 排序数据
    const sorterData = {};
    if(sorter.field) {
      sorterData.OrderField = sorter.field;
      if(sorter.order === 'descend') {
        sorterData.IsDesc = true;
      } else {
        sorterData.IsDesc = false;
      }
    }

    // 修改 store 数据
    DiagnosticPlatform.setData({
        /** 不分页注释掉 ***********************************************************************************/
        /*
      pagination: {
        ...DiagnosticPlatform.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
        },
*/
/** 不分页注释掉 ***********************************************************************************/
      orderField: sorterData.OrderField || null,
      isDesc: sorterData.IsDesc || false,
    });

    // 发起请求
    DiagnosticPlatform.fetchList({
        /** 不分页注释掉 ***********************************************************************************/
        /*
      CurrentPage: pagination.current,
      PageSize: pagination.pageSize,
      */
/** 不分页注释掉 ***********************************************************************************/
      ...DiagnosticPlatform.searchFormValues,
      ...sorterData,
    });
  }

  // 勾选
  onSelectionChange = (selectedRowKeys, selectedRows) => {
    const { DiagnosticPlatform } = this.props;

    DiagnosticPlatform.setData({
      selectedRowKeys,
    });
  }

  handleDownload = () => {
    
    const { DiagnosticPlatform } = this.props;

    console.log('start downloading.....');

    DiagnosticPlatform.download();

    console.log('finish download.....');
    
  }

  //导入组件
  handleImportAssembly=()=>{
    this.setState({
      modalUploadProps:{
        ...this.state.modalUploadProps,
        title:'导入组件', 
        visible:true,
        action:`${api}/DiagnosticPlatform/ImportAssembly`,
      },
    });
  }
  //导入链表
  handleImportNetlist=()=>{
    this.setState({
      modalUploadProps:{
        ...this.state.modalUploadProps,
        title:'导入链表', 
        visible:true,
        action:`${api}/DiagnosticPlatform/ImportNetlist`,
      },
    });
  }


  
  handleCalculate = (Params) => {
    const { DiagnosticPlatform } = this.props;
    //设置计算关联模态框的显示/隐藏
    this.setCalculate_ModalVisible(true);
    DiagnosticPlatform.Calculate({
      Params,
    }).then(() => {
      //设置计算关联模态框的显示/隐藏
      this.setCalculate_ModalVisible(false);
      message.success('计算成功');
    }).catch((e) => {
      //设置计算关联模态框的显示/隐藏
      this.setCalculate_ModalVisible(false);
      message.error(`操作失败：${e.Message}`);
    });
  
  }

  render() {
    const { DiagnosticPlatform } = this.props;

    // 关于列的属性
    const columns ={};

    // 计算鉴权后列表宽度总数
    const totalWidth = DiagnosticPlatform.authMenuListField.reduce((total, current) => (total + columns[current.Number].width), 0);

    // 鉴权后的列
    const authColumns = [
      { 
        title: '序号',
        dataIndex: 'NO',
        width: '6%',
        className:'alignCenter', 
          /** 不分页使用下面的 ***********************************************************************************/
          render: (text, row, index) =>(index + 1),
/** 不分页使用下面的 ***********************************************************************************/
      },
      ...DiagnosticPlatform.authMenuListField.map((item, index) => {
        let obj = {
          title: item.Name,
          dataIndex: item.Number,
          key: item.Number,
          ...columns[item.Number],
          width: (94 * columns[item.Number].width/totalWidth).toFixed(0) + '%',
        };

        // 最后一列不设置 width
        if(index === DiagnosticPlatform.authMenuListField - 1) {
          obj.width = undefined;
        }

        // 排序
        if(item.IsSortFields) {
          obj = {
            ...obj,
            sorter: true, 
            sortOrder: DiagnosticPlatform.orderField === item.Number && (DiagnosticPlatform.isDesc ? 'descend' : 'ascend'),
          };
        }

        return obj;
      }),
    ];

    return (
      <Layout className={styles.layout}>
      <Sider width={250}  style={{ height: window.innerHeight - 110, overflowY: 'scroll', overflowX: 'auto', background: '#fff' }}>
      <DisplayTree
            treeList={[{
              id: '0',
              name: '精确诊断系统',
              depthlevel: 0,
              children: DiagnosticPlatform.treeListData!=null ?DiagnosticPlatform.treeListData.slice():[],
            }]}
            onSelect={this.onSelect}
            onExpand={this.onExpand}
            //selectedKeys={AdministrativeArea.selectedKeys.slice()}
            loadData={this.onLoadData}
            showIcons={true}
            expandedKeys={this.state.expandedKeys}
            autoExpandParent={false}
          />
        </Sider>

        <Content>
        <Modal title='正在处理中，请等待...'
          closable={false}
          maskClosable={false}
          visible={this.state.Calculate_Modalvisible}
          footer={null}
        >
        </Modal>
          <ModalUpload {...this.state.modalUploadProps}
          />
          <DiagnosticPlatformToolBar 
            DiagnosticPlatform={DiagnosticPlatform}
            handleNew={this.handleNew}
            handleEdit={this.handleEdit}
            handleRemoveChecked={this.handleRemoveChecked}
            handleDownload={this.handleDownload}
            handleImportAssembly={this.handleImportAssembly}
            handleImportNetlist={this.handleImportNetlist}
            handleCalculate={this.handleCalculate}
          />
          <DiagnosticPlatformForm
            DiagnosticPlatform={DiagnosticPlatform}
            modalVisible={this.state.modalVisible}
            setModalVisible={this.setModalVisible}
          />
          <div className={styles.tableAlert}>
            <Alert
              message={(
                <div>
                  已选择 <a style={{ fontWeight: 600 }}>{DiagnosticPlatform.selectedRowKeys.length}</a> 项
                  <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }} disabled={DiagnosticPlatform.selectedRowKeys.length <= 0}>清空</a>
                </div>
              )}
              type="info"
              showIcon
            />
          </div>
          {
            DiagnosticPlatform.authMenuListField && DiagnosticPlatform.authMenuListField.length > 0 &&
            <Table
              bordered
              size="small"
              loading={DiagnosticPlatform.loading}
              /** 不分页使用下面的 ***********************************************************************************/
               pagination={false}
/** 不分页使用下面的 ***********************************************************************************/
              dataSource={DiagnosticPlatform.list.slice()}
              columns={authColumns}
              rowKey="UniqueID"
              onChange={this.handleTableChange}
              rowSelection={{
                selectedRowKeys: DiagnosticPlatform.selectedRowKeys,
                onChange: this.onSelectionChange,
              }}
              scroll={{ y: window.innerHeight - 220 }}
              onRow={(record) => {
                return {
                  // 点击行执行
                  onClick: () => {
                    const set = new Set(DiagnosticPlatform.selectedRowKeys);
                    if(set.has(record.UniqueID)) {
                      set.delete(record.UniqueID);
                    } else {
                      set.add(record.UniqueID);
                    }
                    DiagnosticPlatform.setData({
                      selectedRowKeys: Array.from(set),
                    });
                  },       
                };
              }}
            />
          }
          
        </Content>
      </Layout>
    );
  }
}
