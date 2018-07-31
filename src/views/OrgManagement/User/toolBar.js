import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Form, Button, Icon, Input, Menu, Dropdown, Modal } from 'antd';

import styles from './toolBar.less';

const FormItem = Form.Item;
const { confirm } = Modal;

@Form.create()
@observer
export default class UserToolBar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      expandForm: false,
    }
  }


  handleSearch = (e) => {

    e.preventDefault();
    e.stopPropagation();

    const { form, User } = this.props;

    form.validateFields((err, values) => {
      if (!err) {
        // 去掉 search- 前缀
        const receivedValues = {};
        Object.keys(values).forEach(key => {
          receivedValues[key.replace('search-', '')] = values[key];
        });

        console.log('Received values of form: ', receivedValues);

        // // 格式化查询参数
        // Object.keys(receivedValues).forEach(key => {
        //   if(receivedValues[key]) {
        //     if(key === 'LM_OperateStartTime' || key === 'LM_OperateEndTime') {
        //       receivedValues[key] = receivedValues[key].format('YYYY-MM-DD');
        //     }
        //   }
        // });

        // 修改 store 数据
        User.setData({
          searchFormValues: receivedValues,
          pagination: {
            ...User.pagination,
            current: 1, //刷新时重置页码
          },
        });

        // 排序数据
        let orderData = {};
        if(User.orderField) {
          orderData = {
            OrderField: User.orderField,
            IsDesc: User.isDesc,
          }
        }

        // 发起请求
        User.fetchList({
          OrganizationID: User.selectedKeys[0],
          CurrentPage: 1,
          PageSize: User.pagination.pageSize,
          ...orderData,
          ...receivedValues,
        });
      }
    });
  }

  // 重置
  handleFormReset = () => {
    const { form, User } = this.props;
    
    form.resetFields();

    User.setData({
      searchFormValues: {},
    });
  }

  // 展开、关闭
  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }

  onButtonClick = ({key}) => {
    const {
      handleResetPwd, handleEnableUser, handleRoleEdit,
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
      case 'l-resetPwd':
        handleResetPwd();
        break;
      case 'l-enableUser':
        confirm({
          title: "确认要启用该用户吗？",
          content: '',
          onOk: () => {
            handleEnableUser([1]);
          },
        });
        break;
      case 'l-disableUser':
        confirm({
          title: "确认要禁用该用户吗？",
          content: '',
          onOk: () => {
            handleEnableUser([0]);
          },
        });
        break;
      case 'l-role':
        handleRoleEdit();
        break;
      default:
        return;
    }
  }
  
  render() {
    const { getFieldDecorator } = this.props.form;
    const { expandForm } = this.state;
    const { User } = this.props;


    let formItems = [
      {
        label: '登录名',
        id: 'LoginName',
        component: <Input placeholder="请输入登录名" />,
      },
      {
        label: '手机',
        id: 'MobilePhone',
        component: <Input placeholder="请输入手机号码" />,
      },
      {
        label: '姓名',
        id: 'FullName',
        component: <Input placeholder="请输入姓名" />,
      },
    ];

    // 鉴权过滤掉不显示的字段
    formItems = formItems.filter(item => {
      return User.authMenuListField.some(field => field.Number === item.id);
    });

    return (
      <div className={styles.toolBar}>
        <Form onSubmit={this.handleSearch} layout="inline">
          {/* 第一个要显示的查询框 */}
          {
            formItems && formItems.length > 0 &&
            <FormItem label={formItems[0].label}>
              {getFieldDecorator(`search-${formItems[0].id}`)(
                formItems[0].component
              )}
            </FormItem>
          }
          {/* 展开后要显示的查询框 */}
          {
            expandForm && formItems && formItems.length > 1 &&
            <span>
              {
                formItems.map((item, index) => {
                  if(index === 0) {
                    return null;
                  }
                  return (
                    <FormItem label={item.label} key={item.id}>
                      {getFieldDecorator(`search-${item.id}`)(
                        item.component
                      )}
                    </FormItem>
                  );
                })
              }
            </span>
          }
          {
            formItems && formItems.length > 0 && 
            <div className={styles.buttons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 12 }} onClick={this.handleFormReset}>重置</Button>
              {
                formItems && formItems.length > 1 &&
                <a style={{ marginLeft: 12 }} onClick={this.toggleForm}>
                  { expandForm ? <span>收起 <Icon type="up" /></span> : <span>展开 <Icon type="down" /></span> }
                </a>
              }
            </div>
          }
          <div className={styles.buttonGroups}>
            <Button.Group >
              {
                User.authMenuListButton.map(item => {
                  let itemBtn = null;
                  
                  // 有子节点的要显示子节点的按钮
                  if(item.hasChildren && item.children && item.children.length > 0) {
                    const menu = (
                      <Menu onClick={this.onButtonClick}>
                        {
                          item.children.map(child => {
                            let disabled = false;
                            // 只有选中一条记录时可用
                            if(['l-resetPwd', 'l-enableUser', 'l-disableUser', 'l-role'].includes(child.id)) { 
                              disabled = User.selectedRowKeys.length !== 1;
                            }

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
                      loading = User.newBtnLoading;
                    }
  
                    let disabled = false;
                    if(['l-edit'].indexOf(item.id) !==-1) { // 只有选中一条记录时可用
                      disabled = User.selectedRowKeys.length !== 1;
                    } else if(['l-delete'].indexOf(item.id) !==-1) { // 存在被选中的记录时可用
                      disabled = User.selectedRowKeys.length < 1;
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
        </Form>
      </div>
    );
  }
}