import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Form, Row, Col, Input, Modal, Radio, DatePicker, message } from 'antd';

import styles from './form.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;

@Form.create({
  onFieldsChange(props, changedFields) {
    const { User } = props;
    User.setCurrentFormField(changedFields);
  },
  mapPropsToFields(props) {
    const { currentForm }  = props.User;
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
export default class UserForm extends Component {

  // 表单提交
  handleSubmit = (e) => {
    const { form, User, setModalVisible } = this.props;

    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        Object.keys(values).forEach(key => {
          if(values[key]) {
            if(key === 'DateOfBirth' || key === 'DateOfBirth') {
              values[key] = values[key].format('YYYY-MM-DD');
            }
          }
        });

        const data = {
          LoginName: values.LoginName,
          Employee: {
            OrganizationID: User.selectedKeys[0],
            ...values,
          },
        };
        if (User.currentForm.UniqueID && User.currentForm.UniqueID.value) {
          data.UniqueID = User.currentForm.UniqueID.value;
          data.Employee.UniqueID = User.currentForm.EmployeeID.value;
        }
        if (values.LoginPwd) {
          data.LoginPwd = values.LoginPwd;
        }

        User.commit(data).then(() => {
          message.success('提交成功');
          setModalVisible(false);
          User.setData({
            selectedRowKeys: [],
          });
        }).catch(({ ModelState }) => {
          if(ModelState)
          {
            // 设置服务器返回的错误校验信息
            let fields = {};
            Object.keys(ModelState).forEach(key => {
              fields[key.replace("Employee.","")] = {
                value: values[key],
                errors: [new Error(ModelState[key])],
              }
            });
            

            form.setFields(fields);
          }
        }); 
      }
    });
  }

  afterClose = () => {
    const { User } = this.props;
    User.clearCurrentForm();
    User.setData({
      currentDetail: null,
    });
  }
  

  render() {

    const { getFieldDecorator } = this.props.form;

    const { modalVisible, setModalVisible, User } = this.props;

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
        title="用户管理"
        okText="确定"
        cancelText="取消"
        width="750px"
        visible={modalVisible}
        onOk={this.handleSubmit}
        onCancel={() => setModalVisible(false)}
        afterClose={this.afterClose}
      >
        {
          // 需要密码字段在编辑时不显示，这里是为了让form重新挂载，否则表单域中仍然有密码字段
          modalVisible &&
          <Form className={styles.form}>
            <Row gutter={24} >
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label="账户"
                >
                  {getFieldDecorator('LoginName', {
                    rules: [{
                      required: true, message: '请输入账户',
                    }],
                  })(
                    <Input />,
                  )}
                </FormItem>
              </Col>
              {
                !User.currentForm.UniqueID && 
                <Col span={12}>
                  <FormItem
                    {...formItemLayout}
                    label="密码"
                  >
                    {getFieldDecorator('LoginPwd', {
                      rules: [{
                        required: true, message: '请输入密码', max: 48,
                      }],
                    })(
                      <Input type="password" />,
                    )}
                  </FormItem>
                </Col>
              }
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label="姓名"
                >
                  {getFieldDecorator('FullName', {
                    rules: [{
                      required: true, message: '请输入姓名',
                    }],
                  })(
                    <Input />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label="手机"
                >
                  {getFieldDecorator('MobilePhone', {
                    rules: [{
                      required: true, message: '请输入手机号码',
                    }, {
                      pattern: /^[0-9]*$/, message: '请输入正确格式的手机号码',
                    }],
                  })(
                    <Input />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label="工号"
                >
                  {getFieldDecorator('JobNumber')(
                    <Input />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label="邮箱"
                >
                  {getFieldDecorator('Email')(
                    <Input />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label="性别"
                >
                  {getFieldDecorator('Gender')(
                    <RadioGroup>
                      <Radio value={'男'}>男</Radio>
                      <Radio value={'女'}>女</Radio>
                    </RadioGroup>,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem 
                  {...formItemLayout}
                  label="生日"
                >
                  {getFieldDecorator('DateOfBirth')(
                    <DatePicker />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label="备注"
                >
                  {getFieldDecorator('Remarks')(
                    <TextArea autosize />,
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        }
      </Modal>
    );
  }
}