import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Form, Row, Col, Input, DatePicker, Divider , TreeSelect } from 'antd';

import styles from './index.less';

const FormItem = Form.Item;

@Form.create({
  onFieldsChange(props, changedFields) {
    const { RapidDevelop } = props;
    console.log('onFieldsChange', changedFields);
    RapidDevelop.setBaseConfigFormField(changedFields);
  },
  mapPropsToFields(props) {
    const { baseConfigForm }  = props.RapidDevelop;
    console.log('mapPropsToFields', baseConfigForm);

    let fields = {};
    Object.keys(baseConfigForm).forEach( key => {
      fields[key] = Form.createFormField({
        ...baseConfigForm[key],
      });
    });

    return fields;
  },
  onValuesChange(_, values) {
    console.log(values);
  },
})
@observer
export default class BaseConfigForm extends Component {
  
  componentDidMount(){
    const { RapidDevelop } = this.props;
    RapidDevelop.fetchFunctionMenuData();
  }

  // 表单提交
  handleNextStep = (goNext) => {
    const { form, RapidDevelop } = this.props;

    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const data = {
          ...values,
          FunctionName:values.MenuID.label,
          MenuID:values.MenuID.value,
        };
        console.log('values', data);

        //临时保存数据

        RapidDevelop.setData({
          tempBaseConfigData:data,
        });

        goNext();
        
        // if (RapidDevelop.baseConfigForm.UniqueID && RapidDevelop.baseConfigForm.UniqueID.value) {
        //   data.UniqueID = RapidDevelop.baseConfigForm.UniqueID.value;
        // }

        // RapidDevelop.commit(data).then(() => {
        //   message.success('提交成功');
        //   setModalVisible(false);
        //   RapidDevelop.setData({
        //     selectedRowKeys: [],
        //   });
        // }).catch(({ ModelState }) => {
          
        //   // 设置服务器返回的错误校验信息
        //   let fields = {};
        //   Object.keys(ModelState).forEach(key => {
        //     fields[key] = {
        //       value: values[key],
        //       errors: [new Error(ModelState[key])],
        //     }
        //   });

        //   form.setFields(fields);
        // });
              
      }
    });
  }

  handleOutputDirectoryChange = (e) => {
    const { RapidDevelop, form } = this.props;
    const value = e.target.value;
    if(value) {
      RapidDevelop.setBaseConfigForm({
        RoutePrefix: `${value}/${RapidDevelop.baseConfigForm.ControllerName.value}`,
      });
      form.setFieldsValue({
        RoutePrefix: `${value}/${RapidDevelop.baseConfigForm.ControllerName.value}`,
      });
    }
  }

  render() {

    const { getFieldDecorator } = this.props.form;
    const { RapidDevelop } = this.props;
    
    const formItemLayout = {
      labelCol: {
        xs: { span: 8 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 16 },
        sm: { span: 16 },
      },
    };

    return (
      <Form className={styles.form}>
        <Divider>名称设置</Divider>
        <Row gutter={24} >
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label="创建者"
            >
              {getFieldDecorator('Creator', {
                rules: [{
                  required: true, message: '请输入创建者',
                }],
              })(
                <Input />,
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label="创建日期"
            >
              {getFieldDecorator('CreateTime', {
                rules: [
                  {
                    required: true, message: '请选择创建日期',
                  },
                ],
              })(
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                />,
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label="实体类名称"
            >
              {getFieldDecorator('ModelName', {
                rules: [{
                  required: true, message: '请输入实体类名称',
                }],
              })(
                <Input />,
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label="业务类名称"
            >
              {getFieldDecorator('ContextName', {
                rules: [{
                  required: true, message: '请输入业务类名称',
                }],
              })(
                <Input />,
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label="控制器名称"
            >
              {getFieldDecorator('ControllerName', {
                rules: [{
                  required: true, message: '请输入控制器名称',
                }],
              })(
                <Input />,
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label="功能名称"
            >
              {getFieldDecorator('MenuID', {
                rules: [{
                  required: true, message: '请输入功能名称',
                }],
              })(
                <TreeSelect
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={ RapidDevelop.functionMenuTree.slice()}
                    placeholder="请选择"
                    treeDefaultExpandAll
                    labelInValue
                  />,
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label="实体类命名空间"
            >
              {getFieldDecorator('ModelNameSpace', {
                rules: [{
                  required: true, message: '请输入实体类命名空间',
                }],
              })(
                <Input />,
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label="业务类命名空间"
            >
              {getFieldDecorator('ContextNameSpace', {
                rules: [{
                  required: true, message: '请输入业务类命名空间',
                }],
              })(
                <Input />,
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label="控制器命名空间"
            >
              {getFieldDecorator('ControllerNameSpace', {
                rules: [{
                  required: true, message: '请输入控制器命名空间',
                }],
              })(
                <Input />,
              )}
            </FormItem>
          </Col>
          <Divider>输出目录</Divider>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label="输出的区域目录"
            >
              {getFieldDecorator('OutputDirectory', {
                rules: [
                //   {
                //   required: true, message: '请输入输出的区域目录',
                // }
              ],
              })(
                <Input onChange={this.handleOutputDirectoryChange} placeholder="文件最终输出的目录为根目录+区域目录" />,
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label="控制器路由前缀"
            >
              {getFieldDecorator('RoutePrefix', {
                rules: [{
                  required: true, message: '请输入控制器路由前缀',
                }],
              })(
                <Input placeholder="可以理解是对区域目录中的控制器路由的的一个简写" />,
              )}
            </FormItem>
          </Col>
          {/* <Divider>输出目录配置实体类</Divider> */}
          
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label="实体类输出的根目录"
            >
              {getFieldDecorator('ModelOutputPath', {
                rules: [{
                  required: true, message: '请输入实体类输出的根目录',
                }],
              })(
                <Input />,
              )}
            </FormItem>
          </Col>
          
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label="业务类输出的根目录"
            >
              {getFieldDecorator('ContextOutputPath', {
                rules: [{
                  required: true, message: '请输入业务类输出的根目录',
                }],
              })(
                <Input />,
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label="控制器输出的根目录"
            >
              {getFieldDecorator('ControllerOutputPath', {
                rules: [{
                  required: true, message: '请输入控制器输出的根目录',
                }],
              })(
                <Input />,
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label="应用输出的根目录"
            >
              {getFieldDecorator('WebOutputPath', {
                rules: [{
                  required: true, message: '请输入应用输出的根目录',
                }],
              })(
                <Input />,
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}