import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Alert, Modal, Badge, message } from 'antd';
import moment from 'moment';

import styles from './index.less';
import OperationLogToolBar from './toolBar';

const { confirm } = Modal;

@inject('OperationLog')
@observer
export default class OperationLog extends Component {

  componentWillMount() {
    const { OperationLog } = this.props;
    OperationLog.reset();
  }

  componentDidMount() {
    const { OperationLog } = this.props;
    OperationLog.fetchAuthMenuListButton();
    OperationLog.fetchAuthMenuFormButton();
    OperationLog.fetchAuthMenuListField();
    OperationLog.refreshList();
    OperationLog.fetchOperateTypeTextValue();
  }

  componentWillUnmount() {
    const { OperationLog } = this.props;
    OperationLog.reset();
  }

  // 清空选中条目
  cleanSelectedKeys = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { OperationLog } = this.props;

    OperationLog.setData({
      selectedRowKeys: [],
    });
  }

  // 批量删除选中条目
  handleRemoveChecked = () => {

    const { OperationLog } = this.props;

    confirm({
      title: `确认要删除这 ${OperationLog.selectedRowKeys.length} 条记录吗?`,
      content: '',
      onOk: () => {
        this.handleRemove(OperationLog.selectedRowKeys);
      },
    });
  }

  // 删除
  handleRemove = (Params) => {
    const { OperationLog } = this.props;

    OperationLog.remove({
      Params,
    }).then(() => {
      message.success('删除成功');
      // 在选中条目中清除已经删除的
      OperationLog.setData({
        selectedRowKeys: OperationLog.selectedRowKeys.filter(item => (Params.indexOf(item) === -1)),
      });
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }

  // 表格分页、排序等的回调函数
  handleTableChange = (pagination, filters, sorter) => {
    const { OperationLog } = this.props;
    console.log(sorter);
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
    else{
      sorterData.OrderField=OperationLog.orderField;
      sorterData.IsDesc = false;
    }

    // 修改 store 数据
    OperationLog.setData({
      pagination: {
        ...OperationLog.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      orderField: sorterData.OrderField || null,
      isDesc: sorterData.IsDesc || false,
    });

    // 发起请求
    OperationLog.fetchList({
      CurrentPage: pagination.current,
      PageSize: pagination.pageSize,
      ...OperationLog.searchFormValues,
      ...sorterData,
    });
  }

  // 勾选
  onSelectionChange = (selectedRowKeys, selectedRows) => {
    const { OperationLog } = this.props;

    OperationLog.setData({
      selectedRowKeys,
    });
  }
  // 指定哪些不可被勾选
  getCheckboxProps = record => ({
    disabled: record.name === 'Disabled User', // Column configuration not to be checked
  }) 

  render() {

    const { OperationLog } = this.props;

    const columns = {
      LM_OperateUser: { 
        width: 80,
      },
      LM_OperateTime: { 
        width: 160, 
        render: (text, row, index) => { 
          return new moment(text).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      LM_Menu: { 
        width: 100,
      },
      LM_OperateType: { 
        width: 100,
      },
      LM_IPAddress: { 
        width: 100,
      },
      LM_URL: { 
        width: 600,
      },
      LM_HttpMethod: { 
        width: 100,
      },
      LM_Result: { 
        width: 100, 
        render: (result) => {
          if(result) {
            return <Badge status="success" text="成功" />;
          } else {
            return <Badge status="error" text="失败" />;
          }
        },
      },
      LM_Description: { 
        width: 160,
      },
    };

    // 计算鉴权后列表宽度总数
    const totalWidth = OperationLog.authMenuListField.reduce((total, current) => (total + columns[current.SerialNumber].width), 0);

    // 鉴权后的列
    const authColumns = [
      { 
        title: '序号',
        dataIndex: 'NO',
        width: 60,
        className:'alignCenter', 
        render: (text, row, index) =>(
          index + 1 + (OperationLog.pagination.current - 1) * OperationLog.pagination.pageSize
        ),
        fixed: true,
      },
      ...OperationLog.authMenuListField.map((item, index) => {
        let obj = {
          title: item.Name,
          dataIndex: item.SerialNumber,
          key: item.SerialNumber,
          ...columns[item.SerialNumber],
        };
        // 排序
        if(item.IsSortFields) {
          obj = {
            ...obj,
            sorter: true, 
            sortOrder: OperationLog.orderField === item.SerialNumber && (OperationLog.isDesc ? 'descend' : 'ascend'),
          };
        }

        return obj;
      }),
    ];

    return (
      <div className={styles.content}>
        
        <OperationLogToolBar
        OperationLog={OperationLog}
        handleRemoveChecked={this.handleRemoveChecked}
        />

        <div className={styles.toolbar}>
        </div>
        <div className={styles.tableAlert}>
          <Alert
            message={(
              <div>
                已选择 <a style={{ fontWeight: 600 }}>{OperationLog.selectedRowKeys.length}</a> 项
                <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }} disabled={OperationLog.selectedRowKeys.length <= 0}>清空</a>
              </div>
            )}
            type="info"
            showIcon
          />
        </div>
        {
          OperationLog.authMenuListField && OperationLog.authMenuListField.length > 0 &&
          <Table
            bordered
            loading={OperationLog.loading}
            pagination={{
              showSizeChanger: true, 
              showQuickJumper: true,
              showTotal: (total, range) => `共 ${total} 条`,
              ...OperationLog.pagination,
            }}
            dataSource={OperationLog.list.slice()}
            columns={authColumns}
            rowKey="UniqueID"
            onChange={this.handleTableChange}
            rowSelection={{
              selectedRowKeys: OperationLog.selectedRowKeys,
              onChange: this.onSelectionChange,
              getCheckboxProps: this.getCheckboxProps,
            }}
            scroll={{ x: totalWidth + 100, y: window.innerHeight - 280 }}
            size="small"
            onRow={(record) => {
              return {
                // 点击行执行
                onClick: () => {
                  const set = new Set(OperationLog.selectedRowKeys);
                  if(set.has(record.UniqueID)) {
                    set.delete(record.UniqueID);
                  } else {
                    set.add(record.UniqueID);
                  }
                  OperationLog.setData({
                    selectedRowKeys: Array.from(set),
                  });
                },       
              };
            }}
          />
        }
      </div>
      
    );
  }
}
