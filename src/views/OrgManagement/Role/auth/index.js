import React, { Component } from 'react';
import { observer } from 'mobx-react';

import StepModal from '@/components/StepModal';
import RoleMenu from './roleMenu';
import RoleMenuButton from './roleMenuButton';
import RoleMenuField from './roleMenuField';

@observer
export default class Auth extends Component {

  

  render() {
    const { Role, authModalVisible, setAuthModalVisible } = this.props;

    const steps = [{
      title: '系统功能',
      component: RoleMenu,
      // 组件被Form.create()等包裹
      isWrappedComponent: false, 
      props: {
        Role,
      },
      // Modal 窗口关闭时触发
      afterClose: () => {
        const { Role } = this.props;
        Role.setData({
          roleMenuTree: [],
          roleMenuCheckedKeys: [],
          roleMenuHalfCheckedKeys: [],
        });
        Role.setData({
          selectedRowKeys: [],
        });
      },
    }, {
      title: '系统按钮',
      component: RoleMenuButton,
      isWrappedComponent: false,
      props: {
        Role,
      },
      afterClose: () => {
        const { Role } = this.props;
        Role.setData({
          roleMenuButtonTree: [],
          roleMenuButtonCheckedKeys: [],
          roleMenuButtonHalfCheckedKeys: [],
        });
      },
    }, {
      title: '系统视图',
      component: RoleMenuField,
      isWrappedComponent: false,
      props: {
        Role,
      },
      afterClose: () => {
        const { Role } = this.props;
        Role.setData({
          roleMenuFieldTree: [],
          roleMenuFieldCheckedKeys: [],
          roleMenuFieldHalfCheckedKeys: [],
        });
      },
    }];

    return (
      <StepModal
        modalVisible={authModalVisible}
        setModalVisible={setAuthModalVisible}
        title="角色授权"
        steps={steps}
      />
    );
  }
}