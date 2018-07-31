import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Layout, Table, message } from 'antd';
import moment from 'moment';

import TableViewToolBar from './toolBar';
import styles from './index.less';


const { Content } = Layout;

@observer
export default class TableView extends Component {
  
  handleNextStep = (goNext) => {
    const { currentUser, RapidDevelop } = this.props;
    if(RapidDevelop.selectedRow[0]) {
      RapidDevelop.setBaseConfigForm({
        Creator: currentUser.currentUser.UserName,
        CreateTime: moment(Date.now()),
        ModelName: RapidDevelop.selectedRow[0].Name,
        ContextName: RapidDevelop.selectedRow[0].Name,
        ControllerName: RapidDevelop.selectedRow[0].Name,
        RoutePrefix: `${RapidDevelop.baseConfigForm.OutputDirectory ? RapidDevelop.baseConfigForm.OutputDirectory.value : ''}${RapidDevelop.selectedRow[0].Name}`,
      });

      RapidDevelop.fetchFieldList({
        ...RapidDevelop.selectedRow[0],
        IsTable: RapidDevelop.selectedRow[0].Category === '表' ? true : false,
      }).then(()=>{
        //给SelectedFiledList 赋值
        const formatDataTypeToControl = (data) => {
          const _dataType=data.DataType;
          if( data.Name === 'UniqueID' ){
            return 7;
          }else if(_dataType === 'varchar'){
            return 3;
          }else if( _dataType==='date' || _dataType === 'datetime' ){
            return 1;
          }
          else if(_dataType==='int' || _dataType === 'tinyint'){
            return 4;
          }
          else {
            return 3;
          }          
        };
        RapidDevelop.setData({
          selectedFieldList:RapidDevelop.selectedRow[0].fieldList.map((item)=>({
            ...item,
            Remark: item.Caption,
            Required: !item.IsNullable,
            Control: formatDataTypeToControl(item),
            MaxLength: item.Length,
            ListIsShow: false,
            DataType:item.DataType,
          })),
        })
      }
    );
      
      goNext();
    } else {
      message.error('请选择一个表或视图');
    }
    
  }

  componentDidMount() {
    const { RapidDevelop } = this.props;
    // RapidDevelop.fetchTVList();

    if(RapidDevelop.dbList && RapidDevelop.dbList.length <= 0) {
      RapidDevelop.fetchDbList().then(() => {
        RapidDevelop.setData({
          TVListSearchField: {
            'search-ServerID': {
              name: 'search-ServerID',
              value: `${RapidDevelop.dbList[0].DbIdentity}---${RapidDevelop.dbList[0].DbCategory}`,
            },
          },
        });
        RapidDevelop.fetchTVList({
          ServerID: RapidDevelop.dbList[0].DbIdentity,
          DbCategory: RapidDevelop.dbList[0].DbCategory,
        });
      });
    }
  }


  // 勾选
  onSelectionChange = (selectedRowKeys, selectedRows) => {
    const { RapidDevelop } = this.props;

    RapidDevelop.setData({
      selectedRowKeys,
    });
  }

  onExpandedRowsChange = (expandedRows) => {
    const { RapidDevelop } = this.props;
    RapidDevelop.setData({
      expandedRowKeys: expandedRows,
    });
    expandedRows.forEach(key => {
      if(!RapidDevelop.loadedFieldListRowsSet.has(key)) {
        const listItem = RapidDevelop.TVList.filter(item => item.UniqueID === key)[0];
        RapidDevelop.fetchFieldList({
          ...listItem,
          IsTable: listItem.Category === '表' ? true : false,
        });
      }
    })
  }

  render() {
    const { RapidDevelop } = this.props;

    const expandedRowRender = (record) => {
      const columns = [
        { title: '表名', dataIndex: 'TableName', key: 'TableName' },
        { title: '列名', dataIndex: 'Name', key: 'Name' },
        { title: '列说明', dataIndex: 'Caption', key: 'Caption' },
        { title: '数据类型', dataIndex: 'DataType', key: 'DataType' },
        { title: '长度', dataIndex: 'Length', key: 'Length' },
        { title: '小数位数', dataIndex: 'Scale', key: 'Scale' },
        { title: '标识', dataIndex: 'IsIdentity', key: 'IsIdentity' },
        { title: '主键', dataIndex: 'Primarykey', key: 'Primarykey' },
        { title: '允许空', dataIndex: 'IsNullable', key: 'IsNullable' },
        { title: '默认值', dataIndex: 'DefaultValue', key: 'DefaultValue' },
      ];

      return (
        <Table
          size="small"
          columns={columns}
          rowKey="UniqueID"
          dataSource={record.fieldList ? record.fieldList.slice() : []}
          pagination={false}
        />
      );
    };

    const columns = [{ 
      title: '序号',
      dataIndex: 'NO',
      width: '6%',
      className:'alignCenter', 
      render: (text, row, index) =>(index + 1),
    }, {
      title: '表名或视图名',
      dataIndex: 'Name',
      key: 'Name',
      width: '30%',
    }, {
      title: '类别',
      dataIndex: 'Category',
      key: 'Category',
      width: '30%',
    }, {
      title: '注释说明',
      dataIndex: 'Caption',
      key: 'Caption',
    }];

    return (
      <Layout className={styles.layout}>
        <Content>
          <TableViewToolBar 
            RapidDevelop={RapidDevelop}
          />
          <Table
            bordered
            size="small"
            loading={RapidDevelop.loading}
            pagination={false}
            dataSource={RapidDevelop.TVList.slice()}
            columns={columns}
            rowKey="UniqueID"
            onChange={this.handleTableChange}
            expandedRowKeys={RapidDevelop.expandedRowKeys.slice()}
            expandedRowRender={expandedRowRender}
            onExpandedRowsChange={this.onExpandedRowsChange}
            rowSelection={{
              selectedRowKeys: RapidDevelop.selectedRowKeys,
              onChange: this.onSelectionChange,
              type: 'radio',
            }}
            scroll={{ y: window.innerHeight - 320 }}
            onRow={(record) => {
              return {
                // 点击行执行
                onClick: () => {
                  RapidDevelop.setData({
                    selectedRowKeys: [record.UniqueID],
                  });
                },       
              };
            }}
          />
        </Content>
      </Layout>
    );
  }
}
