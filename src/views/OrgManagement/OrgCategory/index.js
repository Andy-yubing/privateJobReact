import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Layout, Table, Modal, message, Alert } from 'antd';

import OrgCategoryForm from './form';
import OrgCategoryToolBar from './toolBar';
import styles from './index.less';


const { Content } = Layout;
const { confirm } = Modal;

@inject('OrgCategory')
@observer
export default class OrgCategory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
    }
  }

  componentWillMount() {
    const { OrgCategory } = this.props;
    OrgCategory.reset();
  }
  
  componentDidMount() {
    const { OrgCategory } = this.props;
    OrgCategory.fetchAuthMenuListButton();
    OrgCategory.fetchAuthMenuFormButton();
    OrgCategory.fetchAuthMenuListField();
    OrgCategory.refreshList();
  }

  componentWillUnmount() {
    const { OrgCategory } = this.props;
    OrgCategory.reset();
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
    const { OrgCategory } = this.props;

    OrgCategory.fetchDetail().then(() => {
      OrgCategory.setCurrentForm(OrgCategory.currentDetail);
      this.setModalVisible(true);
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }
  
  // 清空选中条目
  cleanSelectedKeys = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { OrgCategory } = this.props;

    OrgCategory.setData({
      selectedRowKeys: [],
    });
  }

  // 批量删除选中条目
  handleRemoveChecked = () => {

    const { OrgCategory } = this.props;
    
    confirm({
      title: `确认要删除这 ${OrgCategory.selectedRowKeys.length} 条记录吗?`,
      content: '',
      onOk: () => {
        this.handleRemove(OrgCategory.selectedRowKeys);
      },
    });
  }

  // 删除
  handleRemove = (Params) => {
    const { OrgCategory } = this.props;

    OrgCategory.remove({
      Params,
    }).then(() => {
      message.success('删除成功');
      // 在选中条目中清除已经删除的
      OrgCategory.setData({
        selectedRowKeys: OrgCategory.selectedRowKeys.filter(item => (Params.indexOf(item) === -1)),
      });
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }

  handleTableChange = (pagination, filters, sorter) => {
    console.log('pagination', pagination);
    console.log('filters', filters);
    console.log('sorter', sorter);
  }

  // 勾选
  onSelectionChange = (selectedRowKeys, selectedRows) => {
    const { OrgCategory } = this.props;

    OrgCategory.setData({
      selectedRowKeys,
    });
  }

  render() {
    const { OrgCategory } = this.props;

    // 关于列的属性
    const columns = {
      Name: {
        width: 30,
      }, 
      SortCode: {
        width: 30,
      }, 
      DescInfo: {
        width: 40,
      }, 
    };

    // 计算鉴权后列表宽度总数
    const totalWidth = OrgCategory.authMenuListField.reduce((total, current) => (total + columns[current.SerialNumber].width), 0);

    // 鉴权后的列
    const authColumns = [
      { 
        title: '序号',
        dataIndex: 'NO',
        width: '6%',
        className:'alignCenter', 
        render: (text, row, index) =>(index + 1),
      },
      ...OrgCategory.authMenuListField.map((item, index) => {
        let obj = {
          title: item.Name,
          dataIndex: item.SerialNumber,
          key: item.SerialNumber,
          ...columns[item.SerialNumber],
          width: (94 * columns[item.SerialNumber].width/totalWidth).toFixed(0) + '%',
        };

        // 最后一列不设置 width
        if(index === OrgCategory.authMenuListField - 1) {
          obj.width = undefined;
        }

        // 排序
        if(item.IsSortFields) {
          obj = {
            ...obj,
            sorter: true, 
            sortOrder: OrgCategory.orderField === item.SerialNumber && (OrgCategory.isDesc ? 'descend' : 'ascend'),
          };
        }

        return obj;
      }),
    ];

    return (
      <Layout className={styles.layout}>
        <Content>
          <OrgCategoryToolBar 
            OrgCategory={OrgCategory}
            handleNew={this.handleNew}
            handleEdit={this.handleEdit}
            handleRemoveChecked={this.handleRemoveChecked}
          />
          <OrgCategoryForm
            OrgCategory={OrgCategory}
            modalVisible={this.state.modalVisible}
            setModalVisible={this.setModalVisible}
          />
          <div className={styles.tableAlert}>
            <Alert
              message={(
                <div>
                  已选择 <a style={{ fontWeight: 600 }}>{OrgCategory.selectedRowKeys.length}</a> 项
                  <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }} disabled={OrgCategory.selectedRowKeys.length <= 0}>清空</a>
                </div>
              )}
              type="info"
              showIcon
            />
          </div>
          {
            OrgCategory.authMenuListField && OrgCategory.authMenuListField.length > 0 &&
            <Table
              bordered
              size="small"
              loading={OrgCategory.loading}
              pagination={false}
              dataSource={OrgCategory.list.slice()}
              columns={authColumns}
              rowKey="UniqueID"
              onChange={this.handleTableChange}
              rowSelection={{
                selectedRowKeys: OrgCategory.selectedRowKeys,
                onChange: this.onSelectionChange,
              }}
              scroll={{ y: window.innerHeight - 220 }}
              onRow={(record) => {
                return {
                  // 点击行执行
                  onClick: () => {
                    const set = new Set(OrgCategory.selectedRowKeys);
                    if(set.has(record.UniqueID)) {
                      set.delete(record.UniqueID);
                    } else {
                      set.add(record.UniqueID);
                    }
                    OrgCategory.setData({
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
