import React, { Component } from 'react';
import { Layout, Icon, Avatar, Dropdown, Menu, Breadcrumb  } from 'antd';
import { observer } from 'mobx-react';
import { Link, withRouter } from 'react-router-dom';

import styles from './index.less';

const { Header } = Layout;
const api = window.PUBLIC_ENV_CONFIG.API;

@observer
class BasicHeader extends Component {

  onMenuClick = ({ key }) => {
    if (key === 'logout') {
      const { currentUser } = this.props;
      currentUser.logout();
    }
  }

  render() {
    const { global, currentUser } = this.props;

    const menu = (
      <Menu selectedKeys={[]} onClick={this.onMenuClick}>
        <Menu.Item disabled>
          <Link to='/Basic/PersonalCenter'> 
            <Icon type="user" />个人中心
          </Link>
        </Menu.Item>
        {/* <Menu.Item disabled><Icon type="setting" />设置</Menu.Item> */}
        <Menu.Divider />
        <Menu.Item key="logout"><Icon type="logout" />退出登录</Menu.Item>
      </Menu>
    );

    return (
      <Header className={styles.header}>
        <div className={styles.left}>
          <Icon
            className={styles.trigger}
            type={global.collapsed ? 'menu-unfold' : 'menu-fold'}
            onClick={() => global.toggleCollapsed()}
          />
          <Breadcrumb className={styles.breadcrumb}>
            {
              global.selectedDirList && global.selectedDirList.map(item => (
                <Breadcrumb.Item key={item.id}>{item.name}</Breadcrumb.Item>
              ))
            }
          </Breadcrumb>
        </div>
        <div className={styles.right}>
          <Dropdown overlay={menu} placement="bottomRight">
            <div className={`${styles.user} ${styles.action}`}>
              <Avatar className={styles.avatar} icon="user" src={currentUser.currentUser.Logo.length>0?`${api}/Images/UserAvatar/${currentUser.currentUser.Logo}`:''}/>
              <span>{currentUser.currentUser.UserName}</span>
            </div>
          </Dropdown>
        </div>
      </Header>
    );
  }
}

export default BasicHeader;