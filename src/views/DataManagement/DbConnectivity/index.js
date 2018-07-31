import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Layout, Table, Modal, message, Alert } from 'antd';

import DbConnectivityForm from './form';
import DbConnectivityToolBar from './toolBar';
import styles from './index.less';


const { Content } = Layout;
const { confirm } = Modal;

@inject('DbConnectivity')
@observer
export default class DbConnectivity extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
    }
  }

  componentWillMount() {
    const { DbConnectivity } = this.props;
    DbConnectivity.reset();
  }
  
  componentDidMount() {
    const { DbConnectivity } = this.props;
    DbConnectivity.fetchAuthMenuListButton();
    DbConnectivity.fetchAuthMenuFormButton();
    DbConnectivity.fetchAuthMenuListField();
    DbConnectivity.refreshList();
  }

  componentWillUnmount() {
    const { DbConnectivity } = this.props;
    DbConnectivity.reset();
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
    const { DbConnectivity } = this.props;

    DbConnectivity.fetchDetail().then(() => {
      DbConnectivity.setCurrentForm(DbConnectivity.currentDetail);
      this.setModalVisible(true);
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }
  
  // 清空选中条目
  cleanSelectedKeys = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { DbConnectivity } = this.props;

    DbConnectivity.setData({
      selectedRowKeys: [],
    });
  }

  // 批量删除选中条目
  handleRemoveChecked = () => {

    const { DbConnectivity } = this.props;
    
    confirm({
      title: `确认要删除这 ${DbConnectivity.selectedRowKeys.length} 条记录吗?`,
      content: '',
      onOk: () => {
        this.handleRemove(DbConnectivity.selectedRowKeys);
      },
    });
  }

  // 删除
  handleRemove = (Params) => {
    const { DbConnectivity } = this.props;

    DbConnectivity.remove({
      Params,
    }).then(() => {
      message.success('删除成功');
      // 在选中条目中清除已经删除的
      DbConnectivity.setData({
        selectedRowKeys: DbConnectivity.selectedRowKeys.filter(item => (Params.indexOf(item) === -1)),
      });
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }

  handleTest = () => {
    const { DbConnectivity } = this.props;

    DbConnectivity.testList({
      UniqueID: DbConnectivity.selectedRowKeys[0],
    }).then(() => {
      message.success('测试成功');
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }

  handleDownload = () => {
    const { DbConnectivity } = this.props;

    DbConnectivity.download();
  }

  // 表格分页、排序等的回调函数
  handleTableChange = (pagination, filters, sorter) => {
    const { DbConnectivity } = this.props;

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
    DbConnectivity.setData({
/** 不分页注释掉 ***********************************************************************************/
      // pagination: {
      //   ...DbConnectivity.pagination,
      //   current: pagination.current,
      //   pageSize: pagination.pageSize,
      // },
/** 不分页注释掉 ***********************************************************************************/
      orderField: sorterData.OrderField || null,
      isDesc: sorterData.IsDesc || false,
    });

    // 发起请求
    DbConnectivity.fetchList({
/** 不分页注释掉 ***********************************************************************************/
      // CurrentPage: pagination.current,
      // PageSize: pagination.pageSize,
/** 不分页注释掉 ***********************************************************************************/
      ...DbConnectivity.searchFormValues,
      ...sorterData,
    });
  }

  // 勾选
  onSelectionChange = (selectedRowKeys, selectedRows) => {
    const { DbConnectivity } = this.props;

    DbConnectivity.setData({
      selectedRowKeys,
    });
  }

  render() {
    const { DbConnectivity } = this.props;

    // 关于列的属性
    const columns = {
      DbCategory: {
        width: 30,
      }, 
      DbIdentity: {
        width: 30,
      }, 
      DisplayName: {
        width: 30,
      }, 
      DbName: {
        width: 30,
      }, 
      DataSource: {
        width: 30,
      }, 
    };

    // 计算鉴权后列表宽度总数
    const totalWidth = DbConnectivity.authMenuListField.reduce((total, current) => (total + columns[current.SerialNumber].width), 0);

    // 鉴权后的列
    const authColumns = [
      { 
        title: '序号',
        dataIndex: 'NO',
        width: '6%',
        className:'alignCenter', 
/** 不分页使用下面的 ***********************************************************************************/
        // render: (text, row, index) =>(
        //   index + 1 + (DbConnectivity.pagination.current - 1) * DbConnectivity.pagination.pageSize
        // ),
        render: (text, row, index) =>(index + 1),
/** 不分页使用下面的 ***********************************************************************************/
      },
      ...DbConnectivity.authMenuListField.map((item, index) => {
        let obj = {
          title: item.Name,
          dataIndex: item.SerialNumber,
          key: item.SerialNumber,
          ...columns[item.SerialNumber],
          width: (94 * columns[item.SerialNumber].width/totalWidth).toFixed(0) + '%',
        };

        // 最后一列不设置 width
        if(index === DbConnectivity.authMenuListField - 1) {
          obj.width = undefined;
        }

        // 排序
        if(item.IsSortFields) {
          obj = {
            ...obj,
            sorter: true, 
            sortOrder: DbConnectivity.orderField === item.SerialNumber && (DbConnectivity.isDesc ? 'descend' : 'ascend'),
          };
        }

        return obj;
      }),
    ];

    return (
      <Layout className={styles.layout}>
        <Content>
          <DbConnectivityToolBar 
            DbConnectivity={DbConnectivity}
            handleNew={this.handleNew}
            handleEdit={this.handleEdit}
            handleRemoveChecked={this.handleRemoveChecked}
            handleTest={this.handleTest}
            handleDownload={this.handleDownload}
          />
          <DbConnectivityForm
            DbConnectivity={DbConnectivity}
            modalVisible={this.state.modalVisible}
            setModalVisible={this.setModalVisible}
          />
          <div className={styles.tableAlert}>
            <Alert
              message={(
                <div>
                  已选择 <a style={{ fontWeight: 600 }}>{DbConnectivity.selectedRowKeys.length}</a> 项
                  <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }} disabled={DbConnectivity.selectedRowKeys.length <= 0}>清空</a>
                </div>
              )}
              type="info"
              showIcon
            />
          </div>
          {
            DbConnectivity.authMenuListField && DbConnectivity.authMenuListField.length > 0 &&
            <Table
              bordered
              size="small"
              loading={DbConnectivity.loading}
/** 不分页使用下面的 ***********************************************************************************/
              // pagination={{
              //   showSizeChanger: true, 
              //   showQuickJumper: true,
              //   showTotal: (total, range) => `共 ${total} 条`,
              //   ...DbConnectivity.pagination,
              // }}
              pagination={false}
/** 不分页使用下面的 ***********************************************************************************/
              dataSource={DbConnectivity.list.slice()}
              columns={authColumns}
              rowKey="UniqueID"
              onChange={this.handleTableChange}
              rowSelection={{
                selectedRowKeys: DbConnectivity.selectedRowKeys,
                onChange: this.onSelectionChange,
              }}
              scroll={{ y: window.innerHeight - 220 }}
              onRow={(record) => {
                return {
                  // 点击行执行
                  onClick: () => {
                    const set = new Set(DbConnectivity.selectedRowKeys);
                    if(set.has(record.UniqueID)) {
                      set.delete(record.UniqueID);
                    } else {
                      set.add(record.UniqueID);
                    }
                    DbConnectivity.setData({
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
