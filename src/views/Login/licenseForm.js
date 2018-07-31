import React, { Component } from 'react';
import { Form, Input, Modal , message } from 'antd';

import { observer } from 'mobx-react';

const FormItem = Form.Item;
const { TextArea } = Input;

@Form.create()
@observer
export default class LicenseForm extends Component {

  // componentDidMount = () => {
  //   const {currentUser}=this.props;
  //   if(currentUser.modalVisible)
  //   {
  //     currentUser.fetchSerialNumber();
  //   }
  // }

  handleSubmit = (e) => {
    const { form, currentUser , setModalVisible } = this.props;
    e.preventDefault();
    form.validateFields({ force: true },
      (err, values) => {
        if (!err) {
          currentUser.submitLicense({
            License: values.License,
          }).then(()=>{
            setModalVisible(false);
            message.success('提交成功');
          }).catch((err)=>{
            message.error({err});
          });
        }
      }
    );
  }

  render() {

    const { form, currentUser ,modalVisible , setModalVisible } = this.props;

    const { getFieldDecorator } = form;


    
    const formItemLayout = {
      labelCol: {
        xs: { span: 6 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 18 },
        sm: { span: 18 },
      },
    };
    return (
      <Modal
        title="许可证"
        okText="确定"
        cancelText="取消"
        width="680px"
        visible={modalVisible}
        confirmLoading={currentUser.loading}
        onOk={this.handleSubmit}
        onCancel={() => setModalVisible(false)}
        afterClose={this.afterClose}
      >
      <Form>   
      <FormItem
          label='序列号'
          {...formItemLayout}
        >   
        <div>
          <label >{currentUser.serialNumber}</label>
        </div>
        </FormItem>
        <FormItem
          label='许可证'
          {...formItemLayout}
        >
          {getFieldDecorator('License', {
            rules: [{
              required: true, message: '请输入许可证',
            }],
          })(
            <TextArea autosize={{minRows: 4} } />
          )}
        </FormItem>
      </Form>
      </Modal>
            
    );
  }
}