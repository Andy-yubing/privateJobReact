import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Modal, Table, message } from 'antd';

@observer
export default class RoleSelect extends Component {

  // 表单提交
  handleSubmit = () => {
    const { User, setRoleModalVisible } = this.props;

    User.setMemberRole({
      UniqueID: User.selectedRowKeys[0],
      Params: User.roleSelectedRowKeys,
    }).then(() => {
      message.success('操作成功');
      setRoleModalVisible(false);
      User.setData({
        selectedRowKeys: [],
      });
     }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
     });
  }

  // 勾选
  onSelectionChange = (selectedRowKeys, selectedRows) => {

    const { User } = this.props;
    User.setData({
      roleSelectedRowKeys: selectedRowKeys,
    });
  }

  // 关闭时重置状态
  afterClose = () => {
    const { User } = this.props;

    User.setData({
      roleSelectedRowKeys: [],
    });
  }
  

  render() {
    const { User, roleModalVisible, setRoleModalVisible } = this.props;
    const columns = [{
      title: '角色',
      dataIndex: 'Name',
      key: 'Name',
    }, {
      title: '描述',
      dataIndex: 'DescInfo',
      key: 'DescInfo',
    }];
    return (
      
        <Modal
          title="成员角色"
          visible={roleModalVisible}
          onOk={this.handleSubmit}
          onCancel={() => setRoleModalVisible(false)}
          afterClose={this.afterClose}
        >
          {
            User.memberRole &&
            <Table
              dataSource={User.memberRole.slice()}
              columns={columns}
              rowSelection={{
                selectedRowKeys: User.roleSelectedRowKeys,
                onChange: this.onSelectionChange,
              }}
              rowKey="UniqueID"
              pagination={false}
              showHeader={false}
              size="small"
              bordered
            />
          }
        </Modal>
    );
  }
}