import React, { Component } from 'react';
import { Menu, Icon, Layout } from 'antd';
import { observer } from 'mobx-react';
import { Link, withRouter } from 'react-router-dom';

import styles from './index.less';

const { Sider } = Layout;
const { SubMenu } = Menu;

@withRouter
@observer
class SiderMenu extends Component {

  getMenuItems = (menusData, parentPath = '/Basic') => {
    return menusData.map(item => {

      let itemPath = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');

      if(item.children && item.children.length > 0) {
        return (
          <SubMenu
            key={item.id.toString()}
            title={
              item.icon ? (
                <span>
                  <Icon type={item.icon} />
                  <span>{item.name}</span>
                </span>
              ) : item.name
            }
          >
            {
              this.getMenuItems(item.children, itemPath)
            }
          </SubMenu>
        );
      } else {
        if(item.category === 3) {
          itemPath = `/Basic/SystemManagement/Code/${item.extendValue}`;
        }

        return (
          <Menu.Item key={item.id.toString()}>
            <Link
              to={itemPath}
              replace={itemPath === this.props.location.pathname}
            >
              {
                item.icon && <Icon type={item.icon} />
              }
              <span>{item.name}</span>
            </Link>
          </Menu.Item>
        )
      }
    });
  }

  render() {
    const { global } = this.props;

    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={global.collapsed}
        collapsedWidth={64}
        className={styles.sider}
      >
        <div className={styles.logo} />
        {
          global.menu && global.menu.length > 0 &&
          <Menu
            selectedKeys={global.selectedKeys.slice().map(item => item.toString())}
            openKeys={global.openKeys.slice().map(item => item.toString())}
            mode="inline"
            theme="dark"
            inlineCollapsed={global.collapsed}
            onOpenChange={(openKeys) => {
              global.setData({
                openKeys,
              });
            }}
            onSelect={({ item, key, selectedKeys }) => {
              console.log('selectedKeys',selectedKeys);
              global.setData({
                selectedKeys,
              });
            }}
          >
            {this.getMenuItems(global.menu)}
          </Menu>
        }
        
      </Sider>
    );
  }
}

export default SiderMenu;