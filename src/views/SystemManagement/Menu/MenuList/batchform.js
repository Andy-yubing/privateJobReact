import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import {Modal, Select,Layout, Table,Form } from 'antd';
import styles from './index.less';
const { Header, Content } = Layout;
const { Option } = Select;
const FormItem = Form.Item;

@inject('RapidDevelop')
@observer
export default class BatchNewForm extends Component {
  constructor(props) {
    super(props);
    const { RapidDevelop } = this.props;
    this.state = {
      dbDefaultValue:RapidDevelop.dbList?RapidDevelop.dbList[0].UniqueID:'',
      tbValue: RapidDevelop.TVList?RapidDevelop.TVList[0].Name:'',
      dataSource:RapidDevelop.TVList?this.handlerTbChange(RapidDevelop.TVList[0].Name,null):[],
    }
  }

  componentWillMount() {
    const { RapidDevelop } = this.props;
    // RapidDevelop.fetchTVList();

    if((RapidDevelop.dbList && RapidDevelop.dbList.length <= 0)||typeof(RapidDevelop.dbList)==='undefined') {
       RapidDevelop.fetchDbList().then(() => {
        this.setState({
          dbDefaultValue: RapidDevelop.dbList[0].UniqueID,
        });

        RapidDevelop.fetchTVList({
          ServerID: RapidDevelop.dbList[0].DbIdentity,
          DbCategory: RapidDevelop.dbList[0].DbCategory,
        }).then(()=>{
          this.setState({
            tbValue: RapidDevelop.TVList[0].Name,
          });

          this.handlerTbChange(RapidDevelop.TVList[0].Name,null);
        });
      });
    }
  }

  handlerDbChange=(value, option)=>{
    const _arr=option.props.data.split('---');
    const RapidDevelop=this.props.RapidDevelop;
    RapidDevelop.fetchTVList({
      ServerID: _arr[0],
      DbCategory: _arr[1],
    }).then(()=>{
      this.setState({
        tbValue: RapidDevelop.TVList[0].Name,
      });
    });
  }

  handlerTbChange=(value,option)=>{
    const RapidDevelop=this.props.RapidDevelop;
    const listItem = RapidDevelop.TVList.filter(item => item.Name === value)[0];
     RapidDevelop.fetchFieldList({
      ...listItem,
      IsTable: listItem.Category === '表' ? true : false,
    }).then(()=>{
      this.setState({
        dataSource:RapidDevelop.TVList.filter(item => item.Name === value)[0].fieldList.slice(),
        tbValue:value,
      });
    });
  }
  // 勾选
  onSelectionChange = (selectedRowKeys, selectedRows) => {
    const { RapidDevelop } = this.props;
    RapidDevelop.setData({
      selectedRowKeys,
    });
  }


  handleSubmit=()=>{
    const { RapidDevelop,callback } = this.props;
    const {selectedRowKeys}=RapidDevelop;
    const Name=this.state.tbValue;
    const selectedRows= RapidDevelop.TVList.filter(e=>e.Name===Name)[0].fieldList.filter(f=>selectedRowKeys.indexOf(f.UniqueID)!==-1);
    callback(selectedRows);
  }

  afterClose = () => {
    const { RapidDevelop } = this.props;
    this.setState({
      dbDefaultValue:RapidDevelop.dbList?RapidDevelop.dbList[0].UniqueID:'',
      tbValue: RapidDevelop.TVList?RapidDevelop.TVList[0].Name:'',
      dataSource:RapidDevelop.TVList?this.handlerTbChange(RapidDevelop.TVList[0].Name,null):[],
    });

    RapidDevelop.setData({
      selectedRowKeys:[],
    });
  }

  render() {
    const { modalVisible, setModalVisible,RapidDevelop } = this.props;
    const columns=[
      { 
        title: '序号',
        dataIndex: 'NO',
        width: '10%',
        render: (text, row, index) =>(index + 1),
      },
      { 
        title: '列名',
        dataIndex: 'Name',
        width: '30%',
      },
      { 
        title: '列说明',
        dataIndex: 'Caption',
        width: '30%',
      },
      { 
        title: '数据类型',
        dataIndex: 'DataType',
        width: '30%',
      },
    ];
    return (
      <Modal
        title="批量新建"
        okText="确定"
        cancelText="取消"
        width="800px"
        visible={modalVisible}
        onOk={this.handleSubmit}
        onCancel={() => setModalVisible(false,false)}
        afterClose={this.afterClose}
        maskClosable={false}
      >
      <Layout>
        <Header className={styles.header}>
        <Form layout="inline" className={styles.form}>
        <FormItem>
         <span>服务器标识：
          <Select key='ServerID' defaultValue={this.state.dbDefaultValue} onChange={this.handlerDbChange}>
            {
              RapidDevelop.dbList&&RapidDevelop.dbList.map(item => (
                <Option key={item.UniqueID} value={item.UniqueID}  title={item.DbIdentity}>{item.DbIdentity}</Option>
              ))
            }
          </Select>
         </span>
         </FormItem>
         <FormItem>
          <span>表名：
          <Select key='TableName' value={this.state.tbValue} onChange={this.handlerTbChange}>
          {
              RapidDevelop.TVList&&RapidDevelop.TVList.map(item => (
                <Option key={item.Name} value={item.Name}  title={item.Name}>{item.Name}</Option>
              ))
            }
          </Select>
          </span>
          </FormItem>
        </Form>
        </Header>
        <Content className={styles.content}>
          <Table
          columns={columns}
          dataSource={this.state.dataSource}
          pagination={false}
          rowKey="UniqueID"
          size="small"
          loading={RapidDevelop.loading}
          rowSelection={{
            selectedRowKeys: RapidDevelop.selectedRowKeys,
            onChange: this.onSelectionChange,
            type: 'checkbox',
          }}
          onRow={(record) => {
            return {
              // 点击行执行
              onClick: () => {
                const set = new Set(RapidDevelop.selectedRowKeys);
                if(set.has(record.UniqueID)) {
                  set.delete(record.UniqueID);
                } else {
                  set.add(record.UniqueID);
                }
                RapidDevelop.setData({
                  selectedRowKeys: Array.from(set),
                });
              },       
            };
          }}
          />
        </Content>
      </Layout>
      </Modal>
    );
  }
}