import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Layout, Table, Modal, message, Alert } from 'antd';

import DisplayTree from '@/components/DisplayTree';
import AdministrativeAreaForm from './form';
import AdministrativeAreaToolBar from './toolBar';
import styles from './index.less';


const { Sider, Content } = Layout;
const { confirm } = Modal;

@inject('AdministrativeArea')
@observer
export default class AdministrativeArea extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      modalVisible: false,
      expandedKeys: ['0'],
    }
  }

  componentWillMount() {
    const { AdministrativeArea } = this.props;
    AdministrativeArea.reset();
  }

  componentDidMount() {
    const { AdministrativeArea } = this.props;
    
    AdministrativeArea.fetchAuthMenuListButton();
    AdministrativeArea.fetchAuthMenuFormButton();
    AdministrativeArea.fetchAuthMenuListField();
    AdministrativeArea.fetchTree({
      ParentID: 0,
    });
    AdministrativeArea.refreshList();
  }

  componentWillUnmount() {
    const { AdministrativeArea } = this.props;
    AdministrativeArea.reset();
  }

  // 点击树节点时触发
  onSelect = (selectedKeys, info) => {
    const { AdministrativeArea } = this.props;

    if(selectedKeys.length > 0) {
      AdministrativeArea.setData({
        selectedKeys: selectedKeys,
        selectedRowKeys: [],
        selectedInfo: info.node.props.dataRef,
        pagination: {
          ...AdministrativeArea.pagination,
          current: 1,
        },
      });

      let orderData = {};
      if(AdministrativeArea.orderField) {
        orderData = {
          OrderField: AdministrativeArea.orderField,
          IsDesc: AdministrativeArea.isDesc,
        }
      }
      
      AdministrativeArea.fetchList({
        ParentID: selectedKeys[0],
        CurrentPage: 1,
        PageSize: AdministrativeArea.pagination.pageSize,
        ...orderData,
      });
    }
    this.onLoadData(info.node);

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
  // 树异步加载
  onLoadData = (treeNode) => {
    const { AdministrativeArea } = this.props;
    return new Promise((resolve) => {
      if (treeNode.props.children) {
        resolve();
        return;
      }

      AdministrativeArea.fetchTreeNode({
        ParentID: treeNode.props.dataRef.id,
      }).then(data => {
        treeNode.props.dataRef.children = data;

        AdministrativeArea.setData({
          treeList: [...AdministrativeArea.treeList],
        })
        resolve();
      });
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
    const { AdministrativeArea } = this.props;

    AdministrativeArea.fetchDetail().then(() => {
      AdministrativeArea.setCurrentForm({
        ...AdministrativeArea.currentDetail,
        OldUniqueID: AdministrativeArea.currentDetail.UniqueID,
      });
      this.setModalVisible(true);
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }

  // 清空选中条目
  cleanSelectedKeys = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { AdministrativeArea } = this.props;

    AdministrativeArea.setData({
      selectedRowKeys: [],
    });
  }

  // 批量删除选中条目
  handleRemoveChecked = () => {

    const { AdministrativeArea } = this.props;
    
    confirm({
      title: `确认要删除这 ${AdministrativeArea.selectedRowKeys.length} 条记录吗?`,
      content: '',
      onOk: () => {
        this.handleRemove(AdministrativeArea.selectedRowKeys);
      },
    });
  }

  // 删除
  handleRemove = (Params) => {
    const { AdministrativeArea } = this.props;

    AdministrativeArea.remove({
      Params,
    }).then(() => {
      message.success('删除成功');
      // 在选中条目中清除已经删除的
      AdministrativeArea.setData({
        selectedRowKeys: AdministrativeArea.selectedRowKeys.filter(item => (Params.indexOf(item) === -1)),
      });
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }

  // 表格分页、排序等的回调函数
  handleTableChange = (pagination, filters, sorter) => {
    const { AdministrativeArea } = this.props;

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
    AdministrativeArea.setData({
      pagination: {
        ...AdministrativeArea.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      orderField: sorterData.OrderField || null,
      isDesc: sorterData.IsDesc || false,
    });

    // 发起请求
    AdministrativeArea.fetchList({
      CurrentPage: pagination.current,
      PageSize: pagination.pageSize,
      ...AdministrativeArea.searchFormValues,
      ...sorterData,
    });
  }

  // 勾选
  onSelectionChange = (selectedRowKeys, selectedRows) => {
    const { AdministrativeArea } = this.props;

    AdministrativeArea.setData({
      selectedRowKeys,
    });
  }

  render() {
    const { AdministrativeArea } = this.props;
    const { setModalVisible } = this;

    // 关于列的属性
    const columns = {
      UniqueID: {
        width: 20,
      },  
      MingCheng: {
        width: 20,
      }, 
      QuanPin: {
        width: 20,
      },
      JianPin: {
        width: 20,
      },
      MiaoShu: {
        width: 20,
      },
    };

    // 计算鉴权后列表宽度总数
    const totalWidth = AdministrativeArea.authMenuListField.reduce((total, current) => (total + columns[current.SerialNumber].width), 0);

    // 鉴权后的列
    const authColumns = [
      { 
        title: '序号',
        dataIndex: 'NO',
        width: '7%',
        className:'alignCenter', 
        render: (text, row, index) =>(
          index + 1 + (AdministrativeArea.pagination.current - 1) * AdministrativeArea.pagination.pageSize
        ),
      },
      ...AdministrativeArea.authMenuListField.map((item, index) => {
        let obj = {
          title: item.Name,
          dataIndex: item.SerialNumber,
          key: item.SerialNumber,
          ...columns[item.SerialNumber],
          width: (94 * columns[item.SerialNumber].width/totalWidth).toFixed(0) + '%',
        };

        // 最后一列不设置 width
        if(index === AdministrativeArea.authMenuListField - 1) {
          obj.width = undefined;
        }

        // 排序
        if(item.IsSortFields) {
          obj = {
            ...obj,
            sorter: true, 
            sortOrder: AdministrativeArea.orderField === item.SerialNumber && (AdministrativeArea.isDesc ? 'descend' : 'ascend'),
          };
        }

        return obj;
      }),
    ];

    return (
      <Layout className={styles.layout}>
        <Sider width={250} style={{ height: window.innerHeight - 110, overflowY: 'scroll', overflowX: 'auto', background: '#fff' }}>
          <DisplayTree
            treeList={[{
              id: '0',
              name: '行政地区',
              depthlevel: 0,
              children: AdministrativeArea.treeList.slice(),
            }]}
            //defaultExpandedKeys={['0']}
            onSelect={this.onSelect}
            onExpand={this.onExpand}
            selectedKeys={AdministrativeArea.selectedKeys.slice()}
            loadData={this.onLoadData}
            expandedKeys={this.state.expandedKeys}
            autoExpandParent={false}
          />
        </Sider>
        <Content style={{ paddingLeft: 24 }}>
          <AdministrativeAreaToolBar
            AdministrativeArea={AdministrativeArea}
            handleNew={this.handleNew}
            handleEdit={this.handleEdit}
            handleRemoveChecked={this.handleRemoveChecked}
          />
          <AdministrativeAreaForm
            AdministrativeArea={AdministrativeArea}
            modalVisible={this.state.modalVisible}
            setModalVisible={setModalVisible}
          />
           <div className={styles.tableAlert}>
            <Alert
              message={(
                <div>
                  已选择 <a style={{ fontWeight: 600 }}>{AdministrativeArea.selectedRowKeys.length}</a> 项
                  <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }} disabled={AdministrativeArea.selectedRowKeys.length <= 0}>清空</a>
                </div>
              )}
              type="info"
              showIcon
            />
          </div>
          {
            AdministrativeArea.authMenuListField && AdministrativeArea.authMenuListField.length > 0 &&
            <Table
              bordered
              size="small"
              loading={AdministrativeArea.loading}
              pagination={AdministrativeArea.pagination}
              dataSource={AdministrativeArea.list.slice()}
              columns={authColumns}
              rowKey="UniqueID"
              onChange={this.handleTableChange}
              rowSelection={{
                selectedRowKeys: AdministrativeArea.selectedRowKeys,
                onChange: this.onSelectionChange,
              }}
              scroll={{ y: window.innerHeight - 293 }}
              onRow={(record) => {
                return {
                  // 点击行执行
                  onClick: () => {
                    const set = new Set(AdministrativeArea.selectedRowKeys);
                    if(set.has(record.UniqueID)) {
                      set.delete(record.UniqueID);
                    } else {
                      set.add(record.UniqueID);
                    }
                    AdministrativeArea.setData({
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
