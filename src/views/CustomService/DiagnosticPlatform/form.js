import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Form, Row, Col, Input, Modal, Radio, Select, DatePicker, message } from 'antd';

const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const { Option } = Select;

@Form.create({
  onFieldsChange(props, changedFields) {
    const { DiagnosticPlatform } = props;
    console.log('onFieldsChange', changedFields);

    DiagnosticPlatform.setCurrentFormField(changedFields);
  },
  mapPropsToFields(props) {
    const { currentForm }  = props.DiagnosticPlatform;
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
export default class DiagnosticPlatformForm extends Component {

  // 表单提交
  handleSubmit = (e) => {
    const { form, DiagnosticPlatform, setModalVisible } = this.props;

    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('values', values);
        const data = {
          ...values,
        };
        if (DiagnosticPlatform.currentForm.UniqueID && DiagnosticPlatform.currentForm.UniqueID.value) {
          data.UniqueID = DiagnosticPlatform.currentForm.UniqueID.value;
        }

        DiagnosticPlatform.commit(data).then(() => {
          message.success('提交成功');
          setModalVisible(false);
          DiagnosticPlatform.setData({
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

  afterClose = () => {
    const { DiagnosticPlatform } = this.props;
    DiagnosticPlatform.clearCurrentForm();
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
        title="精确诊断"
        okText="确定"
        cancelText="取消"
        width="750px"
        visible={modalVisible}
        onOk={this.handleSubmit}
        onCancel={() => setModalVisible(false)}
        afterClose={this.afterClose}
      >
        <Form>
          <Row gutter={24} >
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label="名称"
              >
                {getFieldDecorator('Name', {
                  rules: [{
                    required: true, message: '请输入名称',
                  }],
                })(
                  <Input />,
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label="排序代码"
              >
                {getFieldDecorator('SortCode', {
                  rules: [{
                    message: '请输入数字格式排序代码', pattern: /^[0-9]*$/,
                  }],
                })(
                  <Input placeholder="数值越大越靠前" />,
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label="类型"
              >
                {getFieldDecorator('Category', {
                  rules: [{
                    required: true, message: '请选择类型',
                  }],
                })(
                  <Select>
                    <Option value={1}>分类</Option>
                    <Option value={2}>代码</Option>
                  </Select>,
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label="状态"
              >
                {getFieldDecorator('IsAvailable', {
                  rules: [{
                    required: true, message: '请选择是否可用',
                  }],
                })(
                  <RadioGroup>
                    <Radio value={1}>启用</Radio>
                    <Radio value={0}>禁用</Radio>
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
                label="描述"
              >
                {getFieldDecorator('DescInfo')(
                  <TextArea autosize />,
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}