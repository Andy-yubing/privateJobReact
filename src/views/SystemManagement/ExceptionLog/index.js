import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Alert, Modal, message } from 'antd';
import moment from 'moment';

import styles from './index.less';
import ExceptionLogToolBar from './toolBar';
import CopyToClipboard from '@/components/CopyToClipboard';

const { confirm } = Modal;

@inject('ExceptionLog')
@observer
export default class ExceptionLog extends Component {

  componentWillMount() {
    const { ExceptionLog } = this.props;
    ExceptionLog.reset();
  }

  componentDidMount() {
    const { ExceptionLog } = this.props;    
    ExceptionLog.fetchAuthMenuListButton();
    ExceptionLog.fetchAuthMenuFormButton();
    ExceptionLog.fetchAuthMenuListField();
    ExceptionLog.refreshList();
  }

  componentWillUnmount() {
    const { ExceptionLog } = this.props;
    ExceptionLog.reset();
  }

  // 清空选中条目
  cleanSelectedKeys = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { ExceptionLog } = this.props;

    ExceptionLog.setData({
      selectedRowKeys: [],
    });
  }

  // 批量删除选中条目
  handleRemoveChecked = () => {

    const { ExceptionLog } = this.props;

    confirm({
      title: `确认要删除这 ${ExceptionLog.selectedRowKeys.length} 条记录吗?`,
      content: '',
      onOk: () => {
        this.handleRemove(ExceptionLog.selectedRowKeys);
      },
    });
  }

  // 删除
  handleRemove = (Params) => {
    const { ExceptionLog } = this.props;

    ExceptionLog.remove({
      Params,
    }).then(() => {
      message.success('删除成功');
      // 在选中条目中清除已经删除的
      ExceptionLog.setData({
        selectedRowKeys: ExceptionLog.selectedRowKeys.filter(item => (Params.indexOf(item) === -1)),
      });
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }

  // 表格分页、排序等的回调函数
  handleTableChange = (pagination, filters, sorter) => {
    const { ExceptionLog } = this.props;

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
      sorterData.OrderField=ExceptionLog.orderField;
      sorterData.IsDesc = false;
    }

    // 修改 store 数据
    ExceptionLog.setData({
      pagination: {
        ...ExceptionLog.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      orderField: sorterData.OrderField || null,
      isDesc: sorterData.IsDesc || false,
    });

    // 发起请求
    ExceptionLog.fetchList({
      CurrentPage: pagination.current,
      PageSize: pagination.pageSize,
      ...ExceptionLog.searchFormValues,
      ...sorterData,
    });
  }

  // 勾选
  onSelectionChange = (selectedRowKeys, selectedRows) => {
    const { ExceptionLog } = this.props;

    ExceptionLog.setData({
      selectedRowKeys,
    });
  }

  render() {

    const { ExceptionLog } = this.props;

    // 关于列的属性
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
      LM_IPAddress: { 
        width: 100,
      },
      LM_URL: { 
        width: 600,
      },
      LM_Browser: { 
        width: 200,
      },
      LM_HttpMethod: { 
        width: 100,
      },
      LM_Message: { 
        width: 300,
      },
      LM_Source: { 
        width: 200,
      },
      LM_StackTrace: { 
        width:400,
        render: (text, row, index) => { 
          let showData = text;
          if(text && text.length > 100) {
            showData = `${text.substr(0, 100)}...`;
          }
          return (
            <CopyToClipboard text={text}>
              <span>{showData}</span>
            </CopyToClipboard>
          ); 
        },
      },
      LM_Data: { 
        width: 400,
        render: (text, row, index) => { 
          let showData = text;
          if(text && text.length > 100) {
            showData = `${text.substr(0, 100)}...`;
          }
          return (
            <CopyToClipboard text={text}>
              <span>{showData}</span>
            </CopyToClipboard>
          ); 
        },
      },
    };

    // 计算鉴权后列表宽度总数
    const totalWidth = ExceptionLog.authMenuListField.reduce((total, current) => (total + columns[current.SerialNumber].width), 0);

    // 鉴权后的列
    const authColumns = [
      { 
        title: '序号',
        dataIndex: 'NO',
        width: 60,
        className:'alignCenter', 
        render: (text, row, index) =>(
          index + 1 + (ExceptionLog.pagination.current - 1) * ExceptionLog.pagination.pageSize
        ),
        fixed: true,
      },
      ...ExceptionLog.authMenuListField.map((item, index) => {
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
            sortOrder: ExceptionLog.orderField === item.SerialNumber && (ExceptionLog.isDesc ? 'descend' : 'ascend'),
          };
        }

        return obj;
      }),
    ];

    return (
      <div className={styles.content}>
        
        <ExceptionLogToolBar
          ExceptionLog={ExceptionLog}
          handleRemoveChecked={this.handleRemoveChecked}
        />

        <div className={styles.toolbar}>
        </div>
        <div className={styles.tableAlert}>
          <Alert
            message={(
              <div>
                已选择 <a style={{ fontWeight: 600 }}>{ExceptionLog.selectedRowKeys.length}</a> 项
                <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }} disabled={ExceptionLog.selectedRowKeys.length <= 0}>清空</a>
              </div>
            )}
            type="info"
            showIcon
          />
        </div>
        {
          ExceptionLog.authMenuListField && ExceptionLog.authMenuListField.length > 0 &&
          <Table
            bordered
            loading={ExceptionLog.loading}
            pagination={{
              showSizeChanger: true, 
              showQuickJumper: true,
              showTotal: (total, range) => `共 ${total} 条`,
              ...ExceptionLog.pagination,
            }}
            dataSource={ExceptionLog.list.slice()}
            columns={authColumns}
            rowKey="UniqueID"
            onChange={this.handleTableChange}
            rowSelection={{
              selectedRowKeys: ExceptionLog.selectedRowKeys,
              onChange: this.onSelectionChange,
            }}
            scroll={{ x: totalWidth + 100, y: window.innerHeight - 280 }}
            size="small"
            onRow={(record) => {
              return {
                // 点击行执行
                onClick: () => {
                  const set = new Set(ExceptionLog.selectedRowKeys);
                  if(set.has(record.UniqueID)) {
                    set.delete(record.UniqueID);
                  } else {
                    set.add(record.UniqueID);
                  }
                  ExceptionLog.setData({
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
