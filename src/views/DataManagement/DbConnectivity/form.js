import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Form, Row, Col, Input, Modal, Select, message, Button } from 'antd';

const FormItem = Form.Item;
const { Option } = Select;

@Form.create({
  onFieldsChange(props, changedFields) {
    const { DbConnectivity } = props;
    console.log('onFieldsChange', changedFields);

    DbConnectivity.setCurrentFormField(changedFields);
  },
  mapPropsToFields(props) {
    const { currentForm }  = props.DbConnectivity;
    console.log('mapPropsToFields', currentForm);

    let fields = {};
    Object.keys(currentForm).forEach( key => {
      fields[key] = Form.createFormField({
        ...currentForm[key],
      });
    });

    return fields;
  },
})
@observer
export default class DbConnectivityForm extends Component {

  // 表单提交
  handleSubmit = () => {
    const { form, DbConnectivity, setModalVisible } = this.props;

    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('values', values);
        const data = {
          ...values,
        };
        if (DbConnectivity.currentForm.UniqueID && DbConnectivity.currentForm.UniqueID.value) {
          data.UniqueID = DbConnectivity.currentForm.UniqueID.value;
        }

        DbConnectivity.commit(data).then(() => {
          message.success('提交成功');
          setModalVisible(false);
          DbConnectivity.setData({
            selectedRowKeys: [],
          });
        }).catch(({ ModelState }) => {
          
          // 设置服务器返回的错误校验信息
          let fields = {};
          Object.keys(ModelState).forEach(key => {
            fields[key] = {
              value: values[key],
              errors: [new Error(ModelState[key])],
            }
          });

          form.setFields(fields);
        }); 
      }
    });
  }

  // 测试连接
  handleTestConnect = () => {
    const { form, DbConnectivity } = this.props;

    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('values', values);
        const data = {
          ...values,
        };
        if (DbConnectivity.currentForm.UniqueID && DbConnectivity.currentForm.UniqueID.value) {
          data.UniqueID = DbConnectivity.currentForm.UniqueID.value;
        }

        DbConnectivity.testForm(data).then(() => {
          message.success('连接成功');
        }).catch(({ ModelState }) => {
          message.error('连接失败');          
        }); 
      }
    });
  }

  afterClose = () => {
    const { DbConnectivity } = this.props;
    DbConnectivity.clearCurrentForm();
  }
  

  render() {

    const { getFieldDecorator } = this.props.form;

    const { modalVisible, setModalVisible } = this.props;

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
      <Modal
        title="数据库管理"
        okText="确定"
        cancelText="取消"
        width="750px"
        visible={modalVisible}
        onOk={this.handleSubmit}
        onCancel={() => setModalVisible(false)}
        afterClose={this.afterClose}
        footer={[
          <Button key="back" onClick={() => setModalVisible(false)}>取消</Button>,
          <Button key="test" onClick={this.handleTestConnect}>测试连接</Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit}>确定</Button>,
        ]}
      >
        <Form>
          <Row gutter={24} >
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label="数据库类型"
              >
                {getFieldDecorator('DbCategory', {
                  rules: [{
                    required: true, message: '请选择数据库类型',
                  }],
                })(
                  <Select>
                    <Option value={'1'}>SqlServer</Option>
                    <Option value={'2'}>MySql</Option>
                    <Option value={'3'}>Oracle</Option>
                  </Select>,
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label="数据库标识"
              >
                {getFieldDecorator('DbIdentity', {
                  rules: [
                    {
                      required: true, message: '请输入数据库标识',
                    },
                    {
                      max: 16, message: '数据库标识长度过长[16字节,一个中文占2字节]',
                    },
                  ],
                })(
                  <Input />,
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label="显示名称"
              >
                {getFieldDecorator('DisplayName')(
                  <Input />,
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label="数据库名称"
              >
                {getFieldDecorator('DbName', {
                rules: [{
                    required: true, message: '请输入数据库名称',
                  }],
                })(
                  <Input />,
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label="服务器名称"
              >
                {getFieldDecorator('DataSource', {
                rules: [{
                    required: true, message: '请输入服务器名称',
                  }],
                })(
                  <Input />,
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label="登录名"
              >
                {getFieldDecorator('DataLoginName', {
                rules: [{
                    required: true, message: '请输入登录名',
                  }],
                })(
                  <Input />,
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label="密码"
              >
                {getFieldDecorator('DataLoginPwd', {
                rules: [{
                    required: true, message: '请输入密码',
                  }],
                })(
                  <Input type="password" />,
                )}
              </FormItem>
            </Col>
          
          </Row>
        </Form>
      </Modal>
    );
  }
}