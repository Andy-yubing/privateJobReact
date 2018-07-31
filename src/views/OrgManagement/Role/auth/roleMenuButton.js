import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { message } from 'antd';

import DisplayTree from '@/components/DisplayTree';

@observer
export default class RoleMenuButton extends Component {

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
    
    Role.commitRoleMenuButton({
      UniqueID: Role.selectedRowKeys[0],
      Params: [...Role.roleMenuButtonCheckedKeys, ...Role.roleMenuButtonHalfCheckedKeys]
      .filter(item => /^[0-9]+-[0-9]+$/.test(item))
      .map(item => (
        {
          text: item.split('-')[0],
          value: item.split('-')[1],
        }
      )),
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
    Role.fetchRoleMenuButtonTree({
      UniqueID: Role.selectedRowKeys[0],
    });
  }

  onCheck = (checkedKeys, info) => {
    const { Role } = this.props;

    console.log('onCheckRoleMenuButton', checkedKeys, info);
    Role.setData({
      roleMenuButtonCheckedKeys: checkedKeys,
      roleMenuButtonHalfCheckedKeys: info.halfCheckedKeys,
    });
  }
  

  render() {
    const { Role } = this.props;

    return (
      <DisplayTree
        checkable
        defaultExpandAll
        showIcons
        selectable={false}
        treeList={Role.roleMenuButtonTree.slice()}
        onCheck={this.onCheck}
        checkedKeys={Role.roleMenuButtonCheckedKeys.slice()}
      />
    );
  }
}