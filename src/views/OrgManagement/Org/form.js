import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Form, Row, Col, Input, Select, Modal, message } from 'antd';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

@Form.create({
  onFieldsChange(props, changedFields) {
    const { Org } = props;
    console.log('onFieldsChange', changedFields);
    Org.setCurrentFormField(changedFields);
  },
  mapPropsToFields(props) {
    const { currentForm }  = props.Org;
    console.log('mapPropsToFields', currentForm);

    let fields = {};
    Object.keys(currentForm).forEach( key => {
      fields[key] = Form.createFormField({
        ...currentForm[key],
      });
    });

    return fields;
  },
  onValuesChange(_, values) {
    console.log(values);
  },
})
@observer
export default class OrgForm extends Component {

  // 表单提交
  handleSubmit = (e) => {
    const { form, Org, setModalVisible } = this.props;

    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('values', values);
        const data = {
          ...values,
          ParentID: Org.selectedKeys[0],
        };
        if (Org.currentForm.UniqueID && Org.currentForm.UniqueID.value) {
          data.UniqueID = Org.currentForm.UniqueID.value;
        }

        Org.commit(data).then(() => {
          message.success('提交成功');
          setModalVisible(false);
          Org.setData({
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
    const { Org } = this.props;
    Org.clearCurrentForm();
  }
  

  render() {

    const { getFieldDecorator } = this.props.form;

    const { modalVisible, setModalVisible, Org } = this.props;

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
    const formItemLayout2 = {
      labelCol: {
        xs: { span: 4 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 20 },
        sm: { span: 20 },
      },
    };

    return (
      <Modal
        title="机构管理"
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
                {getFieldDecorator('FullName', {
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
                label="机构类别"
              >
                {getFieldDecorator('CategoryID', {
                  rules: [{
                    required: true, message: '请选择机构类别',
                  }],
                })(
                  <Select>
                    {
                      Org.categoryTextValue.map(item => (
                        <Option value={parseInt(item.value, 10)} key={item.value}>{item.text}</Option>
                      ))
                    }
                  </Select>,
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label="机构编码"
              >
                {getFieldDecorator('SerialNumber')(
                  <Input  />,
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
          </Row>
          <Row gutter={24} >
            <Col span={24}>
              <FormItem
                {...formItemLayout2}
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