import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Layout, Table, message, Badge, Modal, Alert } from 'antd';

import RoleToolBar from './toolBar';
import RoleForm from './form';
import Auth from './auth';
import Member from './member';
import styles from './index.less';


const { Content } = Layout;
const { confirm } = Modal;

@inject('Role')
@observer
export default class Role extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      authModalVisible: false,
      memberModalVisible: false,
    }
  }

  componentWillMount() {
    const { Role } = this.props;
    Role.reset();
  }

  componentDidMount() {
    const { Role } = this.props;    
    Role.fetchAuthMenuListButton();
    Role.fetchAuthMenuFormButton();
    Role.fetchAuthMenuListField();
    Role.refreshList();
  }

  componentWillUnmount() {
    const { Role } = this.props;
    Role.reset();
  }


  // 设置模态框显示/隐藏
  setModalVisible = (modalVisible) => {
    this.setState({
      modalVisible,
    });
  }

  setAuthModalVisible = (authModalVisible) => {
    this.setState({
      authModalVisible,
    });
  }

  setMemberModalVisible = (memberModalVisible) => {
    this.setState({
      memberModalVisible,
    });
  }

  // 新建
  handleNew = () => {
    this.setModalVisible(true);
  }

  // 修改
  handleEdit = () => {
    const { Role } = this.props;

    Role.fetchDetail().then(() => {
      Role.setCurrentForm(Role.currentDetail);
      this.setModalVisible(true);
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }
  
  // 清空选中条目
  cleanSelectedKeys = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { Role } = this.props;

    Role.setData({
      selectedRowKeys: [],
    });
  }

  // 批量删除选中条目
  handleRemoveChecked = () => {

    const { Role } = this.props;

    confirm({
      title: `确认要删除这 ${Role.selectedRowKeys.length} 条记录吗?`,
      content: '',
      onOk: () => {
        this.handleRemove(Role.selectedRowKeys);
      },
    });
  }

  // 删除
  handleRemove = (Params) => {
    const { Role } = this.props;

    Role.remove({
      Params,
    }).then(() => {
      message.success('删除成功');
      // 在选中条目中清除已经删除的
      Role.setData({
        selectedRowKeys: Role.selectedRowKeys.filter(item => (Params.indexOf(item) === -1)),
      });
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }

  // 角色授权
  handleAuth = () => {
    this.setAuthModalVisible(true);
  }

  // 角色成员
  handleMember = () => {
    const { Role } = this.props;

    Role.fetchOrgTree().then(tree => {
      Role.setData({
        selectedOrgKeys: [tree[0].id],
      });
      Role.fetchRoleMemberDetail({
        UniqueID: Role.selectedRowKeys[0],
        Params: [tree[0].id],
      });
    });

    Role.fetchRoleMember({
      UniqueID: Role.selectedRowKeys[0],
    });
    
    this.setMemberModalVisible(true);
  }

  // 表格分页、排序等的回调函数
  handleTableChange = (pagination, filters, sorter) => {
    const { Role } = this.props;

    // 修改 store 数据
    Role.setData({
      pagination: {
        ...Role.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
    });

    let sorterData = {};
    if(Role.orderField) {
      sorterData = {
        OrderField: Role.orderField,
        IsDesc: Role.isDesc,
      }
    }

    // 发起请求
    Role.fetchList({
      CurrentPage: pagination.current,
      PageSize: pagination.pageSize,
      ...sorterData,
    });
  }

  // 勾选
  onSelectionChange = (selectedRowKeys, selectedRows) => {
    const { Role } = this.props;

    Role.setData({
      selectedRowKeys,
    });
  }

  render() {
    const { Role } = this.props;

    // 关于列的属性
    const columns = {
      Name: {
        width: 30,
      },  
      DescInfo: {
        width: 40,
      }, 
      IsAvailable: {
        width: 30,
        render: (result) => {
          if(result) {
            return <Badge status="success" text="启用" />;
          } else {
            return <Badge status="error" text="禁用" />;
          }
        },
      },
    };

    // 计算鉴权后列表宽度总数
    const totalWidth = Role.authMenuListField.reduce((total, current) => (total + columns[current.SerialNumber].width), 0);

    // 鉴权后的列
    const authColumns = [
      { 
        title: '序号',
        dataIndex: 'NO',
        width: '6%',
        className:'alignCenter', 
        render: (text, row, index) =>(
          index + 1 + (Role.pagination.current - 1) * Role.pagination.pageSize
        ),
      },
      ...Role.authMenuListField.map((item, index) => {
        let obj = {
          title: item.Name,
          dataIndex: item.SerialNumber,
          key: item.SerialNumber,
          ...columns[item.SerialNumber],
          width: (94 * columns[item.SerialNumber].width/totalWidth).toFixed(0) + '%',
        };

        // 最后一列不设置 width
        if(index === Role.authMenuListField - 1) {
          obj.width = undefined;
        }

        // 排序
        if(item.IsSortFields) {
          obj = {
            ...obj,
            sorter: true, 
            sortOrder: Role.orderField === item.SerialNumber && (Role.isDesc ? 'descend' : 'ascend'),
          };
        }

        return obj;
      }),
    ];

    return (
      <Layout className={styles.layout}>
        <Content>
          <RoleToolBar 
            Role={Role}
            handleNew={this.handleNew}
            handleEdit={this.handleEdit}
            handleRemoveChecked={this.handleRemoveChecked}
            handleAuth={this.handleAuth}
            handleMember={this.handleMember}
          />
          <RoleForm
            Role={Role}
            modalVisible={this.state.modalVisible}
            setModalVisible={this.setModalVisible}
          />
          {/* 角色授权窗口 */}
          <Auth
            Role={Role}
            authModalVisible={this.state.authModalVisible}
            setAuthModalVisible={this.setAuthModalVisible}
          />
          {/* 角色成员设置窗口 */}
          <Member
            Role={Role}
            memberModalVisible={this.state.memberModalVisible}
            setMemberModalVisible={this.setMemberModalVisible}
          />
          <div className={styles.tableAlert}>
            <Alert
              message={(
                <div>
                  已选择 <a style={{ fontWeight: 600 }}>{Role.selectedRowKeys.length}</a> 项
                  <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }} disabled={Role.selectedRowKeys.length <= 0}>清空</a>
                </div>
              )}
              type="info"
              showIcon
            />
          </div>
          {
            Role.authMenuListField && Role.authMenuListField.length > 0 &&
            <Table
              bordered
              size="small"
              loading={Role.loading}
              pagination={Role.pagination}
              dataSource={Role.list.slice()}
              columns={authColumns}
              rowKey="UniqueID"
              onChange={this.handleTableChange}
              rowSelection={{
                selectedRowKeys: Role.selectedRowKeys,
                onChange: this.onSelectionChange,
              }}
              scroll={{ y: window.innerHeight - 220 }}
              onRow={(record) => {
                return {
                  // 点击行执行
                  onClick: () => {
                    const set = new Set(Role.selectedRowKeys);
                    if(set.has(record.UniqueID)) {
                      set.delete(record.UniqueID);
                    } else {
                      set.add(record.UniqueID);
                    }
                    Role.setData({
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
