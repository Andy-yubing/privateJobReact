import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button, Menu, Dropdown, Icon } from 'antd';

import styles from './toolBar.less';

@observer
export default class MenuToolBar extends Component {

  onButtonClick = ({key}) => {
    const {
      handleNew, handleEdit, handleRemoveChecked
    } = this.props;
    
    switch(key)
    {
      case 'l-new':
        handleNew();
        break;
      case 'l-edit':
        handleEdit();
        break;
      case 'l-delete':
        handleRemoveChecked();
        break;
      default:
        return;
    }
  }

  render() {

    const { menu } = this.props;

    return (
      <div className={styles.toolBar}>
        <div className={styles.buttonGroups}>
          <Button.Group >
            {
              menu.authMenuListButton.map(item => {
                let itemBtn = null;

                // 有子节点的要显示子节点的按钮
                if(item.hasChildren && item.children && item.children.length > 0) {
                  const menu = (
                    <Menu onClick={this.onButtonClick}>
                      {
                        item.children.map(child => {
                          let disabled = false;
                          // 这里可以设置 disabled，控制按钮是否可用
                          return (
                            <Menu.Item key={child.id} disabled={disabled}>
                              {
                                child.icon && <Icon type={child.icon} />
                              }
                              {child.name}
                            </Menu.Item>
                          );
                        })
                      }
                    </Menu>
                  );

                  itemBtn = (
                    <Dropdown overlay={menu} key={item.id}>
                      <Button
                        icon={item.icon}
                      >
                        {item.name}<Icon type="down" />
                      </Button>
                    </Dropdown>
                  );

                } else { // 没有子节点的按钮
                  let loading = false;
                  if(item.id === 'l-new') {
                    loading = menu.newBtnLoading;
                  }

                  let disabled = false;
                  if(['l-edit'].indexOf(item.id) !==-1) { // 只有选中一条记录时可用
                    disabled = menu.selectedRowKeys.length !== 1;
                  } else if(['l-delete'].indexOf(item.id) !==-1) { // 存在被选中的记录时可用
                    disabled = menu.selectedRowKeys.length < 1;
                  }

                  itemBtn = (
                    <Button
                      icon={item.icon}
                      key={item.id}
                      onClick={() => this.onButtonClick({key: item.id})}
                      loading={loading}
                      disabled={disabled}
                    >
                      {item.name}
                    </Button>
                  );
                }
                return itemBtn;
              })
            }
          </Button.Group>
        </div>
      </div>
    );
  }
}