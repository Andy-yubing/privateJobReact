import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Form, Button, Input, Select } from 'antd';

import styles from './toolBar.less';

const FormItem = Form.Item;
const { Option } = Select;

@Form.create({
  onFieldsChange(props, changedFields) {
    const { RapidDevelop } = props;
    //console.log('onFieldsChange', changedFields);
    RapidDevelop.setTVListSearchField(changedFields);
  },
  mapPropsToFields(props) {
    const { TVListSearchField }  = props.RapidDevelop;
    //console.log('mapPropsToFields', TVListSearchField);

    let fields = {};
    Object.keys(TVListSearchField).forEach( key => {
      fields[key] = Form.createFormField({
        ...TVListSearchField[key],
      });
    });

    return fields;
  },
  onValuesChange({ RapidDevelop }, values) {
    //console.log(values);
    if(values['search-ServerID']) {
      // 去掉 search- 前缀
      const receivedValues = {};
      Object.keys(values).forEach(key => {
        receivedValues[key.replace('search-', '')] = values[key];
      });

      //console.log('Received values of form: ', receivedValues);

      // 格式化查询参数
      Object.keys(receivedValues).forEach(key => {
        if(receivedValues[key]) {
          if(key === 'ServerID') {
            const list = receivedValues[key].split('---');
            receivedValues[key] = list[0];
            receivedValues.DbCategory = list[1];
          }
        }
      });

      //console.log('Received values of form: ', receivedValues);

      // 发起请求
      RapidDevelop.fetchTVList({
        ...receivedValues,
      });
    }
  },
})
@observer
export default class TableViewToolBar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      expandForm: false,
    }
  }


  handleSearch = (e) => {
    e.preventDefault();

    const { form, RapidDevelop } = this.props;

    form.validateFields((err, values) => {
      if (!err) {
        // 去掉 search- 前缀
        const receivedValues = {};
        Object.keys(values).forEach(key => {
          receivedValues[key.replace('search-', '')] = values[key];
        });

        //console.log('Received values of form: ', receivedValues);

        // 格式化查询参数
        Object.keys(receivedValues).forEach(key => {
          if(receivedValues[key]) {
            if(key === 'ServerID') {
              const list = receivedValues[key].split('---');
              receivedValues[key] = list[0];
              receivedValues.DbCategory = list[1];
            }
          }
        });

        //console.log('Received values of form: ', receivedValues);

        // 发起请求
        RapidDevelop.fetchTVList({
          ...receivedValues,
        });
      }
    });
  }

  // 重置
  handleFormReset = () => {
    const { form, RapidDevelop } = this.props;
    
    form.resetFields(['search-Name']);

    RapidDevelop.setData({
      searchFormValues: {},
    });
  }

  // 展开、关闭
  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { RapidDevelop } = this.props;
    let formItems = [
      {
        label: '服务器标识',
        id: 'ServerID',
        component: (
          <Select>
            {
              RapidDevelop.dbList.map(item => (
                <Option key={item.UniqueID} value={`${item.DbIdentity}---${item.DbCategory}`}>{item.DbIdentity}</Option>
              ))
            }
          </Select>
        ),
      },
      {
        label: '表名或视图名',
        id: 'Name',
        component: <Input />,
      },
    ];

    return (
      <div className={styles.toolBar}>
        <Form onSubmit={this.handleSearch} layout="inline">
          {
            formItems && formItems.length > 0 &&
            <span>
              {
                formItems.map((item, index) => {
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
            </div>
          }
        </Form>
      </div>
    );
  }
}