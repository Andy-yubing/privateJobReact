import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Layout, Table, Alert, Modal, message } from 'antd';
import moment from 'moment';

import DisplayTree from '@/components/DisplayTree';
import UserForm from './form';
import UserToolBar from './toolBar';
import PwdForm from './pwdForm';
import RoleSelect from './roleSelect';

import styles from './index.less';


const { Sider, Content } = Layout;
const { confirm } = Modal;

@inject('User')
@observer
export default class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      // 修改密码框是否显示
      pwdModalVisible: false,
      // 修改角色框是否显示
      roleModalVisible: false,
      expandedKeys:[],
    }
  }

  componentWillMount() {
    const { User } = this.props;
    User.reset();
  }

  componentDidMount() {
    const { User } = this.props;
    User.fetchAuthMenuListButton();
    User.fetchAuthMenuFormButton();
    User.fetchAuthMenuListField();
    User.fetchTree().then((tree) => {
      if(tree && tree.length > 0) {
        User.setData({
          selectedKeys: [tree[0].id.toString()],
          expandedKeys: [tree[0].id.toString()],
        });
        User.refreshList();
      }
    });
  }


  componentWillUnmount() {
    const { User } = this.props;
    User.reset();
  }

  // 设置模态框显示/隐藏
  setModalVisible = (modalVisible) => {
    this.setState({
      modalVisible,
    });
  }

  setPwdModalVisible = (pwdModalVisible) => {
    this.setState({
      pwdModalVisible,
    });
  }

  setRoleModalVisible = (roleModalVisible) => {
    this.setState({
      roleModalVisible,
    });
  }

  // 点击树节点时触发
  onSelect = (selectedKeys,info) => {
    const { User } = this.props;

    if(selectedKeys.length > 0) {
      User.setData({
        selectedKeys: selectedKeys,
        selectedRowKeys: [],
        pagination: {
          ...User.pagination,
          current: 1,
        },
      });
  
      let orderData = {};
      if(User.orderField) {
        orderData = {
          OrderField: User.orderField,
          IsDesc: User.isDesc,
        }
      }
      
      User.fetchList({
        OrganizationID: selectedKeys[0],
        CurrentPage: 1,
        PageSize: User.pagination.pageSize,
        ...User.searchFormValues,
        ...orderData,
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

  onExpand=(expandedKeys, info)=>{
    this.setState({
      expandedKeys,
    });
  }

  // 新建
  handleNew = () => {
    this.setModalVisible(true);
  }

  // 修改
  handleEdit = () => {
    const { User } = this.props;

    User.fetchDetail().then(() => {
      const data = {
        ...User.currentDetail.Employee,
        ...User.currentDetail,
      };
      if(data.DateOfBirth) {
        data.DateOfBirth = moment(data.DateOfBirth);
      }
      User.setCurrentForm(data);
      this.setModalVisible(true);
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }

  // 清空选中条目
  cleanSelectedKeys = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { User } = this.props;

    User.setData({
      selectedRowKeys: [],
    });
  }

  // 批量删除选中条目
  handleRemoveChecked = () => {
    const { User } = this.props;
    confirm({
      title: `确认要删除这 ${User.selectedRowKeys.length} 条记录吗?`,
      content: '',
      onOk: () => {
        this.handleRemove(User.selectedRowKeys);
      },
    });
  }

  // 删除
  handleRemove = (Params) => {
    const { User } = this.props;

    User.remove({
      Params,
    }).then(() => {
      message.success('删除成功');
      // 在选中条目中清除已经删除的
      User.setData({
        selectedRowKeys: User.selectedRowKeys.filter(item => (Params.indexOf(item) === -1)),
      });
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }

  // 重置密码
  handleResetPwd = () => {
    const { User } = this.props;

    User.fetchDetail().then(() => {
      this.setPwdModalVisible(true);
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }

  // 启用/禁用用户 [1] 启用  [0] 禁用
  handleEnableUser = (Params) => {
    const { User } = this.props;
    User.setStatus({
      UniqueID: User.selectedRowKeys[0],
      Params,
     }).then(() => {
      message.success('操作成功');
      User.setData({
        selectedRowKeys: [],
      });
     }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
     });
  }

  // 设置成员角色
  handleRoleEdit = () => {
    const { User } = this.props;
    User.getMemberRole({
      UniqueID: User.selectedRowKeys[0],
    }).then(() => {
      this.setRoleModalVisible(true);
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }

  // 表格分页、排序等的回调函数
  handleTableChange = (pagination, filters, sorter) => {
    const { User } = this.props;

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
    User.setData({
      pagination: {
        ...User.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      orderField: sorterData.OrderField || null,
      isDesc: sorterData.IsDesc || false,
    });

    // 发起请求
    User.fetchList({
      OrganizationID: User.selectedKeys[0],
      CurrentPage: pagination.current,
      PageSize: pagination.pageSize,
      ...User.searchFormValues,
      ...sorterData,
    });
  }

  // 勾选
  onSelectionChange = (selectedRowKeys, selectedRows) => {
    const { User } = this.props;

    User.setData({
      selectedRowKeys,
    });
  }

  render() {
    const { User } = this.props;

    // 关于列的属性
    const columns = {
      LoginName: {
        width: 80,
      }, 
      FullName: {
        width: 100,
      }, 
      JobNumber: {
        width: 100,
      }, 
      UserStatus: {
        width: 80,
      }, 
      MobilePhone: {
        width: 120,
      }, 
      Email: {
        width: 100,
      },
      Gender: {
        width: 50,
      },
      DateOfBirth: {
        width: 150,
        render: (text, row, index) => {
          if(text) {
            return new moment(text).format('YYYY-MM-DD HH:mm:ss');
          }
        },
      },
      RoleName: {
        width: 200,
      }, 
      CreatedTime: {
        width: 150,
        render: (text, row, index) => { 
          return new moment(text).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      Remarks: {
        width: 200,
      },
    };
    // 计算鉴权后列表宽度总数
    const totalWidth = User.authMenuListField.reduce((total, current) => (total + columns[current.SerialNumber].width), 0);

    // 鉴权后的列
    const authColumns = [
      { 
        title: '序号',
        dataIndex: 'NO',
        width: 60,
        className:'alignCenter', 
        render: (text, row, index) =>(
          index + 1 + (User.pagination.current - 1) * User.pagination.pageSize
        ),
        fixed: true,
      },
      ...User.authMenuListField.map((item, index) => {
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
            sortOrder: User.orderField === item.SerialNumber && (User.isDesc ? 'descend' : 'ascend'),
          };
        }

        return obj;
      }),
    ];

    return (
      <Layout className={styles.layout}>
        <Sider width={210} style={{ height: window.innerHeight - 110, overflowY: 'scroll', overflowX: 'auto', background: '#fff' }}>
          <DisplayTree
            treeList={User.treeList.slice()}
            onSelect={this.onSelect}
            onExpand={this.onExpand}
            selectedKeys={User.selectedKeys.slice()}
            //defaultExpandedKeys={User.selectedKeys.slice()}
            expandedKeys={this.state.expandedKeys}
            autoExpandParent={false}
          />
        </Sider>
        <Content style={{ paddingLeft: 24 }}>
          <UserToolBar 
            User={User}
            handleNew={this.handleNew}
            handleEdit={this.handleEdit}
            handleRemoveChecked={this.handleRemoveChecked}
            handleResetPwd={this.handleResetPwd}
            handleEnableUser={this.handleEnableUser}
            handleRoleEdit={this.handleRoleEdit}
          />
          <UserForm
            User={User}
            modalVisible={this.state.modalVisible}
            setModalVisible={this.setModalVisible}
          />
          <PwdForm
            User={User}
            pwdModalVisible={this.state.pwdModalVisible}
            setPwdModalVisible={this.setPwdModalVisible}
          />
          <RoleSelect
            User={User}
            roleModalVisible={this.state.roleModalVisible}
            setRoleModalVisible={this.setRoleModalVisible}
          />
          <div className={styles.tableAlert}>
            <Alert
              message={(
                <div>
                  已选择 <a style={{ fontWeight: 600 }}>{User.selectedRowKeys.length}</a> 项
                  <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }} disabled={User.selectedRowKeys.length <= 0}>清空</a>
                </div>
              )}
              type="info"
              showIcon
            />
          </div>
          {
            User.authMenuListField && User.authMenuListField.length > 0 &&
            <Table
              bordered
              loading={User.loading}
              pagination={{
                showSizeChanger: true, 
                showQuickJumper: true,
                showTotal: (total, range) => `共 ${total} 条`,
                ...User.pagination,
              }}
              dataSource={User.list.slice()}
              columns={authColumns}
              rowKey="UniqueID"
              onChange={this.handleTableChange}
              rowSelection={{
                selectedRowKeys: User.selectedRowKeys,
                onChange: this.onSelectionChange,
              }}
              scroll={{ x: totalWidth + 100, y: window.innerHeight - 293 }}
              size="small"
              onRow={(record) => {
                return {
                  // 点击行执行
                  onClick: () => {
                    const set = new Set(User.selectedRowKeys);
                    if(set.has(record.UniqueID)) {
                      set.delete(record.UniqueID);
                    } else {
                      set.add(record.UniqueID);
                    }
                    User.setData({
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
