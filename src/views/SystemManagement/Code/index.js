import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Layout, Table, Modal, message, Alert } from 'antd';
import { withRouter } from 'react-router-dom';

import DisplayTree from '@/components/DisplayTree';
import CodeForm from './form';
import CodeToolBar from './toolBar';
import styles from './index.less';


const { Sider, Content } = Layout;
const { confirm } = Modal;

@withRouter
@inject('Code', 'global')
@observer
export default class Code extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
    }
  }  

  componentWillMount() {
    const { Code, match } = this.props;
    const codeId = match.params.id || '0';

    Code.reset();
    Code.setData({
      currentPageCodeId: codeId,
      selectedKeys: [codeId],
    });
    Code.fetchTree({
      ParentID: codeId,
    });
    Code.refreshList();

    this.setState({
      expandedKeys: [Code.currentPageCodeId]
    });
  }

  componentWillUnmount() {
    const { Code } = this.props;
    Code.reset();
  }

  // 点击树节点时触发
  onSelect = (selectedKeys,info) => {
    const { Code } = this.props;

    if(selectedKeys.length > 0) {
      Code.setData({
        selectedKeys: selectedKeys,
        selectedRowKeys: [],
        pagination: {
          ...Code.pagination,
          current: 1,
        },
      });
      
      Code.fetchList({
        ParentID: selectedKeys[0],
        CurrentPage: 1,
        PageSize: Code.pagination.pageSize,
      });
    }
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
  // 设置模态框显示/隐藏
  setModalVisible = (modalVisible) => {
    this.setState({
      modalVisible,
    });
  }

  // 新建
  handleNew = () => {
    this.setModalVisible(true);
  }

  // 修改
  handleEdit = () => {
    const { Code } = this.props;

    Code.fetchDetail().then(() => {
      Code.setCurrentForm(Code.currentDetail);
      this.setModalVisible(true);
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }
  
  // 清空选中条目
  cleanSelectedKeys = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { Code } = this.props;

    Code.setData({
      selectedRowKeys: [],
    });
  }

  // 批量删除选中条目
  handleRemoveChecked = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { Code } = this.props;

    
    confirm({
      title: `确认要删除这 ${Code.selectedRowKeys.length} 条记录吗?`,
      content: '',
      onOk: () => {
        this.handleRemove(Code.selectedRowKeys);
      },
    });
  }

  // 删除
  handleRemove = (Params) => {
    const { Code } = this.props;

    Code.remove({
      Params,
    }).then(() => {
      message.success('删除成功');
      // 在选中条目中清除已经删除的
      Code.setData({
        selectedRowKeys: Code.selectedRowKeys.filter(item => (Params.indexOf(item) === -1)),
      });
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }

  // 表格分页、排序等的回调函数
  handleTableChange = (pagination, filters, sorter) => {
    const { Code } = this.props;

    // 排序数据
    // const sorterData = {};
    // if(sorter.field) {
    //   sorterData.OrderField = sorter.field;
    //   if(sorter.order === 'descend') {
    //     sorterData.IsDesc = true;
    //   } else {
    //     sorterData.IsDesc = false;
    //   }
    // }

    // 修改 store 数据
    Code.setData({
      pagination: {
        ...Code.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      // orderField: sorterData.OrderField || null,
      // isDesc: sorterData.IsDesc || false,
    });

    // 发起请求
    Code.fetchList({
      CurrentPage: pagination.current,
      PageSize: pagination.pageSize,
      ...Code.searchFormValues,
      // ...sorterData,
    });
  }

  // 勾选
  onSelectionChange = (selectedRowKeys, selectedRows) => {
    const { Code } = this.props;
    console.log(selectedRowKeys,selectedRows);
    Code.setData({
      selectedRowKeys,
    });
  }

  render() {
    const { Code, global } = this.props;
    const { setModalVisible } = this;
    const columns = [{ 
      title: '序号',
      dataIndex: 'NO',
      width: '7%',
      className:'alignCenter', 
      render: (text, row, index) =>(
        index + 1 + (Code.pagination.current - 1) * Code.pagination.pageSize
      ),
    }, {
      title: '名称',
      dataIndex: 'Name',
      key: 'Name',
      width: '20%',
    }, {
      title: '代码值',
      dataIndex: 'CodeValue',
      key: 'CodeValue',
      width: '20%',
    }, {
      title: '排序',
      dataIndex: 'SortCode',
      key: 'SortCode',
      width: '15%',
    }, {
      title: '类型',
      dataIndex: 'Category',
      key: 'Category',
      width: '15%',
      render: (text, record) => (
        text === 1 ? '分类' : '代码'
      ),
    }, {
      title: '描述',
      dataIndex: 'Remark',
      key: 'Remark',
    }];

    return (
      <Layout className={styles.layout}>
        <Sider width={220} style={{ height: window.innerHeight - 110, overflowY: 'scroll', overflowX: 'auto', background: '#fff' }}>
        <DisplayTree
          treeList={[{
            id: Code.currentPageCodeId,
            name: (global.selectedDirList && global.selectedDirList.length > 0 && global.selectedDirList[global.selectedDirList.length - 1].name) || '代码',
            children: Code.treeList.slice(),
          }]}
          //defaultExpandedKeys={[Code.currentPageCodeId]}
          onSelect={this.onSelect}
          onExpand={this.onExpand}
          selectedKeys={Code.selectedKeys.slice()}
          expandedKeys={this.state.expandedKeys}
          autoExpandParent={false}
        />
        </Sider>
        <Content style={{ paddingLeft: 24 }}>
          <CodeToolBar
            Code={Code}
            handleNew={this.handleNew}
            handleEdit={this.handleEdit}
            handleRemoveChecked={this.handleRemoveChecked}
          />
          <CodeForm
            Code={Code}
            modalVisible={this.state.modalVisible}
            setModalVisible={setModalVisible}
          />
          <div className={styles.tableAlert}>
            <Alert
              message={(
                <div>
                  已选择 <a style={{ fontWeight: 600 }}>{Code.selectedRowKeys.length}</a> 项
                  <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }} disabled={Code.selectedRowKeys.length <= 0}>清空</a>
                </div>
              )}
              type="info"
              showIcon
            />
          </div>
          <Table
            bordered
            size="small"
            loading={Code.loading}
            pagination={Code.pagination}
            dataSource={Code.list.slice()}
            columns={columns}
            rowKey="UniqueID"
            onChange={this.handleTableChange}
            rowSelection={{
              selectedRowKeys: Code.selectedRowKeys,
              onChange: this.onSelectionChange,
            }}
            scroll={{ y: window.innerHeight - 293 }}
            onRow={(record) => {
              return {
                // 点击行执行
                onClick: () => {
                  const set = new Set(Code.selectedRowKeys);
                  if(set.has(record.UniqueID)) {
                    set.delete(record.UniqueID);
                  } else {
                    set.add(record.UniqueID);
                  }
                  Code.setData({
                    selectedRowKeys: Array.from(set),
                  });
                },       
              };
            }}
          />
        </Content>
      </Layout>
    );
  }
}