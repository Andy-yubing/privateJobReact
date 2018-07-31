import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Switch, Layout , Table , Select , Input , message } from 'antd';

import styles from './index.less';

const { Header , Content } = Layout;
const Option = Select.Option;

@observer
export default class FieldSet extends Component {

 // 表单提交
 handleNextStep = (goNext) => {
  const { RapidDevelop } = this.props;

   const submitData={
     DbSetting : {
       ...RapidDevelop.tempDBSettingData,
       Name:RapidDevelop.selectedRow.Name,
     },
     NameSetting : RapidDevelop.tempBaseConfigData,
     PathSetting : RapidDevelop.tempBaseConfigData,
     ListSetting : {
      Paging:false,
      QueryFields:RapidDevelop.selectedFieldList.filter(item=>item.ListIsShow===true),
     },
     FormSetting :{
      FormFields:RapidDevelop.selectedFieldList,
     } 
    };

    RapidDevelop.submitGenerateCode(submitData).then(()=>{
      message.success(`提交成功`);
      
      goNext();
    }).catch((e)=> {
      message.error(`操作失败：${e.Message}`);
    });

  }

  //下拉框的Change
  handleControlChange=(record, value)=>{ 
    const { RapidDevelop } = this.props;
    RapidDevelop.setFieldValue({
      ...record,
      Control:value,
    });
  }
  

  //文本框的Change
  handleRemarkChange=(record, value)=>{ 
    const { RapidDevelop } = this.props;
    
    RapidDevelop.setFieldValue({
      ...record,
      Remark:value,
    });
  }


  //是否显示的Change
  handleShowChange=(record, value)=>{ 
    const { RapidDevelop } = this.props;
    
    RapidDevelop.setFieldValue({
      ...record,
      ListIsShow:value,
    });
  }

  //提示信息的Change
  handlePlaceholderChange=(record, value)=>{ 
    const { RapidDevelop } = this.props;
    
    RapidDevelop.setFieldValue({
      ...record,
      Placeholder:value,
    });
  }
  
  render() {
     
    const { RapidDevelop }=this.props;
    
    const columns = [{
      title: '字段名称',
      dataIndex: 'Name',
      key: 'Name',
    }, {
      title: '字段备注',
      dataIndex: 'Remark',
      key: 'Remark',
      render:(text,record)=>{
        return(
          <Input value={text} disabled={record.Name==="UniqueID"} onChange={(e)=>this.handleRemarkChange(record, e.target.value)} />
        );
      }
    }, {
      title: '输入控件',
      dataIndex: 'Control',
      key: 'Control',
      render:(text, record)=>{
        return (
          <Select value={text} disabled={record.Name==="UniqueID"} style={{ width: 120 }} onChange={(value)=>this.handleControlChange(record, value)}>
            <Option value={1}>日期选择器</Option>
            <Option value={2}>日期范围选择器</Option>
            <Option value={3}>单行文本框</Option>
            <Option value={4}>数字文本框</Option>
            <Option value={5}>多行文本框</Option>
            <Option value={6}>下拉选择器</Option>
            <Option value={7}>隐藏域</Option>
          </Select>
        );
      }
    }, {
      title: '是否必填',
      dataIndex: 'Required',
      key: 'Required',
      render:(text, record)=>(text?'是':'否')
    }, {
      title: '最大长度',
      dataIndex: 'MaxLength',
      key: 'MaxLength',
    }, {
      title: '提示信息',
      dataIndex: 'Placeholder',
      key: 'Placeholder',
      render:(text,record)=>{
        return(
          <Input value={text} disabled={record.Name==="UniqueID"} onChange={(e)=>this.handlePlaceholderChange(record, e.target.value)} />
        );
      }
    }, {
      title: '列表查询条件',
      dataIndex: 'ListIsShow',
      key: 'ListIsShow',
      //className:'alignCenter',       //居中
      render:(text, record)=>{
        return <Switch checked={text} disabled={record.Name==="UniqueID"} onChange={(value)=>this.handleShowChange(record, value)} />;
      }
    }];

    return (
      
      <Layout className={ styles.layout }>
      <Header className={styles.header}>
      是否分页：<Switch checkedChildren="是" unCheckedChildren="否" defaultChecked />
      </Header>

      <Content>
      <Table
        bordered 
        rowKey="UniqueID"
        size="small"
        pagination={false} 
        dataSource={ RapidDevelop.selectedFieldList.slice() } 
        columns={columns} 
      />

      </Content>
      
    </Layout>
      
      
    );

  }
}