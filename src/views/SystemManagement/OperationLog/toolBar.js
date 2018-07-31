import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Form, Button, Icon, Input, DatePicker, Select, Menu, Dropdown } from 'antd';

import styles from './toolBar.less';

const FormItem = Form.Item;
const { Option } = Select;

@Form.create()
@observer
export default class OperationLogToolBar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      expandForm: false,
    }
  }

  handleSearch = (e) => {

    e.preventDefault();
    e.stopPropagation();

    const { form, OperationLog } = this.props;

    form.validateFields((err, values) => {
      if (!err) {
        // 去掉 search- 前缀
        const receivedValues = {};
        Object.keys(values).forEach(key => {
          receivedValues[key.replace('search-', '')] = values[key];
        });

        console.log('Received values of form: ', receivedValues);

        // 格式化查询参数
        Object.keys(receivedValues).forEach(key => {
          if(receivedValues[key]) {
            if(key === 'LM_OperateStartTime' || key === 'LM_OperateEndTime') {
              receivedValues[key] = receivedValues[key].format('YYYY-MM-DD');
            }
          }
        });

        // 修改 store 数据
        OperationLog.setData({
          searchFormValues: receivedValues,
          pagination: {
            ...OperationLog.pagination,
            current: 1, //刷新时重置页码
          },
        });

        // 排序数据
        let orderData = {};
        if(OperationLog.orderField) {
          orderData = {
            OrderField: OperationLog.orderField,
            IsDesc: OperationLog.isDesc,
          }
        }

        // 发起请求
        OperationLog.fetchList({
          CurrentPage: 1,
          PageSize: OperationLog.pagination.pageSize,
          ...orderData,
          ...receivedValues,
        });
      }
    });
  }

  // 重置
  handleFormReset = () => {
    const { form, OperationLog } = this.props;
    
    form.resetFields();

    OperationLog.setData({
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
      handleRemoveChecked
    } = this.props;
    
    switch(key)
    {
      case 'l-delete':
        handleRemoveChecked();
        break;
      default:
        return;
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { OperationLog } = this.props;
    const { expandForm } = this.state;

    let formItems = [
      {
        label: '操作者',
        id: 'LM_OperateUser',
        component: <Input placeholder="请输入操作者" />,
      },
      {
        label: '操作时间',
        id: 'LM_OperateStartTime',
        component: <DatePicker placeholder="操作起始时间" />,
      },
      {
        colon: false,
        id: 'LM_OperateEndTime',
        component: <DatePicker placeholder="操作结束时间" />,
      },
      {
        label: '操作类型',
        id: 'LM_OperateType',
        component: (
          <Select placeholder="请选择操作类型" allowClear>
            {
              OperationLog.operateTypeTextValue.map(item => (
                <Option value={parseInt(item.value, 10)} key={item.value}>{item.text}</Option>
              ))
            }
          </Select>
        ),
      },
    ];

    // 鉴权过滤掉不显示的字段
    formItems = formItems.filter(item => {
      return OperationLog.authMenuListField.some(field => field.Number === item.id);
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
                OperationLog.authMenuListButton.map(item => {
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
                    let disabled = false;
                    if(['l-delete'].indexOf(item.id) !==-1) { // 存在被选中的记录时可用
                      disabled = OperationLog.selectedRowKeys.length < 1;
                    }

                    itemBtn = (
                      <Button
                        icon={item.icon}
                        key={item.id}
                        onClick={() => this.onButtonClick({key: item.id})}
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