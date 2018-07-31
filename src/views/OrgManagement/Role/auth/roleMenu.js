import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { message } from 'antd';

import DisplayTree from '@/components/DisplayTree';

@observer
export default class RoleMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      confirmLoading: false,
    }
  }

  // StepModal 组件调用方法
  handleNextStep = (callback) => {
    const { Role } = this.props;

    this.setState({
      confirmLoading: true,
    });
    
    Role.commitRoleMenu({
      UniqueID: Role.selectedRowKeys[0],
      Params: [...Role.roleMenuCheckedKeys, ...Role.roleMenuHalfCheckedKeys],
    }).then(() => {
      callback();
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
    
    this.setState({
      confirmLoading: false,
    });
  }

  componentDidMount = () => {
    const { Role } = this.props;
    Role.fetchRoleMenuTree({
      UniqueID: Role.selectedRowKeys[0],
    });
  }

  onCheck = (checkedKeys, info) => {
    const { Role } = this.props;

    console.log('onCheckRoleMenu', checkedKeys, info);
    Role.setData({
      roleMenuCheckedKeys: checkedKeys,
      roleMenuHalfCheckedKeys: info.halfCheckedKeys,
    });
  }
  

  render() {
    const { Role } = this.props;

    return (
      <DisplayTree
        checkable
        defaultExpandAll
        selectable={false}
        treeList={Role.roleMenuTree.map(item => ({
          ...item,
        })).slice()}
        onCheck={this.onCheck}
        checkedKeys={Role.roleMenuCheckedKeys.slice()}
      />
    );
  }
}