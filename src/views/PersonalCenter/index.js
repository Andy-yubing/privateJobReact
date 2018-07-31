import React, { Component } from 'react';
import { Tabs, Divider,Form, Input, Button,message } from 'antd';
import { inject, observer } from 'mobx-react';
import UserAvatar from './UserAvatar';
import UserInfoForm from './form';
import moment from 'moment';

const TabPane = Tabs.TabPane;
const FormItem=Form.Item;


@Form.create()
@inject('User','currentUser')
@observer
export default class PersonalCenter extends Component{
  constructor(props)
  {
   super(props);
   this.state={
    disabled:true,
   };
  }
  componentWillMount() {
    const { User } = this.props;
    User.reset();
  }

  componentDidMount(){
    const { User }  = this.props;
    User.fetchDetail(true).then(() => {
      const data = {
        ...User.currentDetail.Employee,
        ...User.currentDetail,
      };
      if(data.DateOfBirth) {
        data.DateOfBirth = moment(data.DateOfBirth);
      }
      User.setCurrentForm(data);

      this.setState({
        disabled:false,
      });
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }

  //密码修改的提交
  handlePwdSubmit=(e)=>{
    const { form,User} = this.props;
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        let _flag=false;
        if(values.OldPassword===values.NewPassword){
          form.setFields({
            NewPassword: {
              value: values.NewPassword,
              errors: [new Error('新密码不能等于旧密码')],
            },
          });
          _flag=true;
        }
        if(values.NewPassword!==values.NewPassword1){
          form.setFields({
            NewPassword1: {
              value: values.NewPassword1,
              errors: [new Error('两次密码不一致')],
            },
          });
          _flag=true;
        }
        if(_flag){
          return;
        }

        let _data={
          Source:2,
          OldPassword:values.OldPassword,
          NewPassword:values.NewPassword1
        };

        User.resetPwd(_data).then(()=>{
          message.success('修改成功');
        }).catch((e)=>{

        });
      }
    });
  }
  render() {
    const { currentUser,User} =this.props;
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
    return (
      <div>
        <Tabs tabPosition='left' defaultActiveKey='info'>
          <TabPane tab="基本信息" key="info">
            <Divider orientation="left">基本信息</Divider>
            <UserInfoForm User={User} currentUser={currentUser}/>
          </TabPane>
          <TabPane tab="我的头像" key="avatar">
            <Divider orientation="left">我的头像</Divider>
            <UserAvatar currentUser={currentUser}/>
          </TabPane>
          <TabPane tab="修改密码" key="password">
            <Divider orientation="left">修改密码</Divider>
            <Form onSubmit={this.handlePwdSubmit}>
              <FormItem label='旧密码' {...formItemLayout}>
                {getFieldDecorator('OldPassword', {
                      rules: [{
                        required: true, message: '请输入旧密码',
                      },
                      {
                        max: 48, message: '密码过长',
                      },
                    ],
                    })(
                    <Input type="password"/>,
                )}
              </FormItem>
              <FormItem label='新密码' {...formItemLayout}>
                {getFieldDecorator('NewPassword', {
                      rules: [{
                        required: true, message: '请输入新密码',
                      },
                      {
                        max: 48, message: '密码过长',
                      },
                      {
                        validator: (rule, value, callback)=>{
                          const { getFieldValue } = this.props.form
                          if (value && value === getFieldValue('OldPassword')) {
                            callback('新密码不能等于旧密码')
                        }
                
                        // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                        callback()
                        },
                      },
                    ],
                    })(
                    <Input type="password"/>,
                )}
              </FormItem>
              <FormItem label='新密码确认' {...formItemLayout}>
                {getFieldDecorator('NewPassword1', {
                      rules: [{
                        required: true, message: '请输入新密码确认',
                      },
                      {
                        validator: (rule, value, callback)=>{
                          const { getFieldValue } = this.props.form
                          if (value && value !== getFieldValue('NewPassword')) {
                            callback('两次密码不一致')
                        }
                
                        // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                        callback()
                        },
                      },
                    ],
                    })(
                    <Input type="password"/>,
                )}
              </FormItem>
              <FormItem {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit" disabled={this.state.disabled}>提交</Button>
              </FormItem>
            </Form>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}