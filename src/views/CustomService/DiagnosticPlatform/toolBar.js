import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Form, Button, Icon, Input, Menu, Dropdown } from 'antd';

import styles from './toolBar.less';

const FormItem = Form.Item;

@Form.create()
@observer
export default class DiagnosticPlatformToolBar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      expandForm: false,
    }
  }


  handleSearch = (e) => {

    e.preventDefault();
    e.stopPropagation();

    const { form, DiagnosticPlatform } = this.props;

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
        DiagnosticPlatform.setData({
          searchFormValues: receivedValues,
        });

        // 排序数据
        let sorterData = {};
        if(DiagnosticPlatform.orderField) {
          sorterData = {
            OrderField: DiagnosticPlatform.orderField,
            IsDesc: DiagnosticPlatform.isDesc,
          }
        }

        // 发起请求
        DiagnosticPlatform.fetchList({
            /** 不分页注释掉 ***********************************************************************************/
            /*
            CurrentPage: 1,
            PageSize: DiagnosticPlatform.pagination.pageSize,
            */
/** 不分页注释掉 ***********************************************************************************/
          ...sorterData,
          ...receivedValues,
        });
      }
    });
  }

  // 重置
  handleFormReset = () => {
    const { form, DiagnosticPlatform } = this.props;
    
    form.resetFields();

    DiagnosticPlatform.setData({
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
    const { handleNew, handleEdit, handleRemoveChecked , handleDownload,handleImportAssembly,handleImportNetlist,handleCalculate } = this.props;
    
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
      case 'l-download':
          handleDownload();
          break;
      case 'l-Calculate':
        handleCalculate();
        break;
      case 'l-importassembly':
          handleImportAssembly();
          break;
      case 'l-importnetlist':
          handleImportNetlist();
          break;
      default:
        return;
    }
  }
  
  render() {
    const { getFieldDecorator } = this.props.form;
    const { expandForm } = this.state;
    const { DiagnosticPlatform } = this.props;

    let formItems = [{
        label: '组件编码',
        id: 'AssemblyCode',
        component: <Input />,}
,
{
        label: '组件名称',
        id: 'AssemblyName',
        component: <Input />,}
,
{
        label: '所属类型',
        id: 'OwnType',
        component: <Input />,}
,
{
        label: '所属类型名称',
        id: 'OwnTypeName',
        component: <Input />,}
,
{
        label: '描述',
        id: 'Description',
        component: <Input />,}
,
{
        label: '父标识',
        id: 'FuBiaoShi',
        component: <Input />,}
,
{
        label: '父名称',
        id: 'FuMingCheng',
        component: <Input />,}
,
{
        label: '排序',
        id: 'CiXu',
        component: <Input />,}
,
{
        label: '停用（0正常、1停用）',
        id: 'TingYong',
        component: <Input />,}
,
{
        label: '创建人ID',
        id: 'CreatorID',
        component: <Input />,}
,
{
        label: '创建时间',
        id: 'CreatedTime',
        component: <Input />,}
,
{
        label: '最后修改人',
        id: 'LastModifiedBy',
        component: <Input />,}
,
{
        label: '最后修改时间',
        id: 'LastModifiedTime',
        component: <Input />,}
,
{
        label: '备用字',
        id: 'BeiYongZi',
        component: <Input />,}
,
{
        label: '备用字符',
        id: 'BeiYongZiFu',
        component: <Input />,}];

    // 鉴权过滤掉不显示的字段
    formItems = formItems.filter(item => {
      return DiagnosticPlatform.authMenuListField.some(field => field.Number === item.id);
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
                DiagnosticPlatform.authMenuListButton.map(item => {
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
                            //   disabled = DiagnosticPlatform.selectedRowKeys.length !== 1;
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
                      loading = DiagnosticPlatform.newBtnLoading;
                    }
  
                    let disabled = false;
                    if(['l-edit'].indexOf(item.id) !==-1) { // 只有选中一条记录时可用
                      disabled = DiagnosticPlatform.selectedRowKeys.length !== 1;
                    } else if(['l-delete'].indexOf(item.id) !==-1) { // 存在被选中的记录时可用
                      disabled = DiagnosticPlatform.selectedRowKeys.length < 1;
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