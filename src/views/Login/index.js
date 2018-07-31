import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';
import { Link } from 'react-router-dom';
import { Form, Icon, Input, Checkbox, Button, Alert } from 'antd';
import { inject, observer } from 'mobx-react';
import styles from './index.less';
import logo from '@/assets/logo.svg';
import LicenseForm from './licenseForm';

const FormItem = Form.Item;

@inject('currentUser')
@Form.create()
@observer
export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
    }
  }
  // 设置模态框显示/隐藏
  setModalVisible = (modalVisible) => {
    this.setState({
      modalVisible,
    });
  }

  componentDidMount = () => {
    const { form } = this.props;
    const loginName = localStorage.getItem('loginName');
    const loginPwd = localStorage.getItem('loginPwd');
    const remember = localStorage.getItem('remember');

    if(remember===true || remember==='true') {
      form.setFieldsValue({
        LoginName: loginName,
        LoginPwd: loginPwd,
        remember: true,
      });
    } else {
      form.setFieldsValue({
        remember: false,
      });
    }
   
    this.inputRef.input.focus();
  }

  handleSubmit = (e) => {
    const { form, currentUser } = this.props;
    e.preventDefault();
    form.validateFields({ force: true },
      (err, values) => {
        if (!err) {
          currentUser.login(values).then((value) => {
            if(value===105){
              this.setModalVisible(true);

              currentUser.fetchSerialNumber();
            }
          });
        }
      }
    );
  }

  renderMessage = (message) => {
    return (
      <Alert
        style={{ marginBottom: 24 }}
        message={message}
        type="error"
        showIcon
      />
    );
  }

  render() {

    const { form, currentUser } = this.props;

    const { getFieldDecorator } = form;

    return (
      <DocumentTitle title="登录">
        <div className={styles.container}>
          <div className={styles.top}>
            <div className={styles.header}>
              <Link to="/">
                <img alt="logo" className={styles.logo} src={logo} />
                <span className={styles.title}>高速公路联网收费系统</span>
              </Link>
            </div>
            <div className={styles.desc}></div>
          </div>
          <div className={styles.main}>
            <Form onSubmit={this.handleSubmit}>
              {
                currentUser.error &&
                currentUser.submitting === false &&
                this.renderMessage(currentUser.error.Message)
              }
              <FormItem>
                {getFieldDecorator('LoginName', {
                  rules: [{
                    required: true, message: '请输入用户名',
                  }],
                })(
                  <Input
                    size="large"
                    prefix={<Icon type="user" className={styles.prefixIcon} />}
                    placeholder="请输入用户名"
                    ref={c => this.inputRef = c}
                  />
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('LoginPwd', {
                  rules: [{
                    required: true, message: '请输入密码',
                  }],
                })(
                  <Input
                    size="large"
                    prefix={<Icon type="lock" className={styles.prefixIcon} />}
                    type="password"
                    placeholder="请输入密码"
                  />
                )}
              </FormItem>
              <FormItem className={styles.additional}>
                {getFieldDecorator('remember', {
                  valuePropName: 'checked',
                  initialValue: false,
                })(
                  <Checkbox className={styles.autoLogin}>记住密码</Checkbox>
                )}
                <Button size="large" loading={currentUser.submitting} className={styles.submit} type="primary" htmlType="submit">
                  登录
                </Button>
              </FormItem>
            </Form>
          </div>
          <LicenseForm
            currentUser={currentUser}
            modalVisible={this.state.modalVisible}
            setModalVisible={this.setModalVisible}
          />
        </div>
      </DocumentTitle>
      
    );
  }
}