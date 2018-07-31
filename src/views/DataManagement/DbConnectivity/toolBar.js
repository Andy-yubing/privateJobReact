import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Form, Button, Icon, Menu, Dropdown } from 'antd';

import styles from './toolBar.less';

const FormItem = Form.Item;

@Form.create()
@observer
export default class DbConnectivityToolBar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      expandForm: false,
    }
  }


  handleSearch = (e) => {

    e.preventDefault();
    e.stopPropagation();

    const { form, DbConnectivity } = this.props;

    form.validateFields((err, values) => {
      if (!err) {
        // 去掉 search- 前缀
        const receivedValues = {};
        Object.keys(values).forEach(key => {
          receivedValues[key.replace('search-', '')] = values[key];
        });

        // // 格式化查询参数
        // Object.keys(receivedValues).forEach(key => {
        //   if(receivedValues[key]) {
        //     if(key === 'LM_OperateStartTime' || key === 'LM_OperateEndTime') {
        //       receivedValues[key] = receivedValues[key].format('YYYY-MM-DD');
        //     }
        //   }
        // });

        // 修改 store 数据
        DbConnectivity.setData({
          searchFormValues: receivedValues,
          // pagination: {
          //   ...DbConnectivity.pagination,
          //   current: 1, //刷新时重置页码
          // },
        });

        // 排序数据
        let sorterData = {};
        if(DbConnectivity.orderField) {
          sorterData = {
            OrderField: DbConnectivity.orderField,
            IsDesc: DbConnectivity.isDesc,
          }
        }

        // 发起请求
        DbConnectivity.fetchList({
          CurrentPage: 1,
          // PageSize: DbConnectivity.pagination.pageSize,
          ...sorterData,
          ...receivedValues,
        });
      }
    });
  }

  // 重置
  handleFormReset = () => {
    const { form, DbConnectivity } = this.props;
    
    form.resetFields();

    DbConnectivity.setData({
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
    const { handleNew, handleEdit, handleRemoveChecked, handleTest, handleDownload } = this.props;
    
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
      case 'l-test':
        handleTest();
        break;
      case 'l-download':
        handleDownload();
        break;
      default:
        return;
    }
  }
  
  render() {
    const { getFieldDecorator } = this.props.form;
    const { expandForm } = this.state;
    const { DbConnectivity } = this.props;


    let formItems = [];

    // 鉴权过滤掉不显示的字段
    formItems = formItems.filter(item => {
      return DbConnectivity.authMenuListField.some(field => field.Number === item.id);
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
                DbConnectivity.authMenuListButton.map(item => {
                  let itemBtn = null;
                  
                  // 有子节点的要显示子节点的按钮
                  if(item.hasChildren && item.children && item.children.length > 0) {
                    const menu = (
                      <Menu onClick={this.onButtonClick}>
                        {
                          item.children.map(child => {
                            let disabled = false;
                            // 只有选中一条记录时可用
                            // if(['l-resetPwd', 'l-enableUser', 'l-disableUser', 'l-role'].includes(child.id)) { 
                            //   disabled = DbConnectivity.selectedRowKeys.length !== 1;
                            // }

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
                      loading = DbConnectivity.newBtnLoading;
                    }
  
                    let disabled = false;
                    if(['l-edit', 'l-test'].indexOf(item.id) !==-1) { // 只有选中一条记录时可用
                      disabled = DbConnectivity.selectedRowKeys.length !== 1;
                    } else if(['l-delete'].indexOf(item.id) !==-1) { // 存在被选中的记录时可用
                      disabled = DbConnectivity.selectedRowKeys.length < 1;
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