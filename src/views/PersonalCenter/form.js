import React, { Component } from 'react';
import { Form, Input, Button,message, Radio, DatePicker } from 'antd';
import { observer } from 'mobx-react';
import styles from './index.less'

const FormItem=Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;

@Form.create({
  onFieldsChange(props, changedFields) {
    const { User } = props;
    User.setCurrentFormField(changedFields);
    
  },
  mapPropsToFields(props) {
      const  {currentForm}   = props.User;

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
export default class UserInfoForm extends Component{
  //基本信息的提交
  handleInfoSubmit=(e)=>{
    const { form, User,currentUser } = this.props;

    e.preventDefault();
    this.props.form.validateFields((err, values) => {
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

          currentUser.setData({
            ...currentUser,
            currentUser:{
              ...currentUser.currentUser,
              UserName:data.Employee.FullName,
            },
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

  render(){
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span:  14 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 5 },
        sm: { span: 16 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };

    return(
      <div>
        <Form onSubmit={this.handleInfoSubmit}>
          <FormItem label='账户' className={styles.formitem}  {...formItemLayout}>
            {getFieldDecorator('LoginName', {
                  rules: [{
                    required: true, message: '请输入账户',
                  },
                  {
                    max: 48, message: '账户过长',
                  },
                ],
                })(
                <Input disabled={true}/>,
            )}
          </FormItem>
          <FormItem label='姓名' className={styles.formitem} {...formItemLayout}>
          {getFieldDecorator('FullName', {
                    rules: [{
                      required: true, message: '请输入姓名',
                    }],
                  })(
                    <Input />,
                  )}
          </FormItem>
          <FormItem label='工号' className={styles.formitem} {...formItemLayout}>
          {getFieldDecorator('JobNumber')(
                    <Input />,
                  )}
          </FormItem>
          <FormItem label='手机号' className={styles.formitem} {...formItemLayout}>
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
          <FormItem label='邮箱' className={styles.formitem} {...formItemLayout}>
          {getFieldDecorator('Email')(
                    <Input />,
                  )}
          </FormItem>
          <FormItem label='性别' className={styles.formitem} {...formItemLayout}>
          {getFieldDecorator('Gender')(
                    <RadioGroup>
                      <Radio value={'男'}>男</Radio>
                      <Radio value={'女'}>女</Radio>
                    </RadioGroup>,
                  )}
          </FormItem>
          <FormItem label='生日' className={styles.formitem} {...formItemLayout}>
          {getFieldDecorator('DateOfBirth')(
                    <DatePicker />
                  )}
          </FormItem>
          <FormItem label='备注' className={styles.formitem} {...formItemLayout}>
          {getFieldDecorator('Remarks')(
                    <TextArea autosize />,
                  )}
          </FormItem>
          <FormItem {...tailFormItemLayout} className={styles.formitem}>
            <Button type="primary" htmlType="submit">提交</Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}