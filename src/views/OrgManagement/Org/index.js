import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Layout, Table, Modal, message, Alert } from 'antd';

import DisplayTree from '@/components/DisplayTree';
import OrgForm from './form';
import OrgToolBar from './toolBar'
import styles from './index.less';


const { Sider, Content } = Layout;
const { confirm } = Modal;

@inject('Org')
@observer
export default class Org extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // 新建的模态框是否显示
      modalVisible: false,
      expandedKeys: ['0'],
    }
  }

  componentWillMount() {
    const { Org } = this.props;
    Org.reset();
  }

  componentDidMount() {
    const { Org } = this.props;
    Org.fetchAuthMenuListButton();
    Org.fetchAuthMenuFormButton();
    Org.fetchAuthMenuListField();
    Org.fetchCategoryTextValue();
    Org.fetchTree();
    Org.refreshList();

  }

  componentWillUnmount() {
    const { Org } = this.props;
    Org.reset();
  }

  // 点击树节点时触发
  onSelect = (selectedKeys,info) => {
    const { Org } = this.props;

    if(selectedKeys.length > 0) {
      Org.setData({
        selectedKeys: selectedKeys,
        selectedRowKeys: [],
      });

      let orderData = {};
      if(Org.orderField) {
        orderData = {
          OrderField: Org.orderField,
          IsDesc: Org.isDesc,
        }
      }
      
      Org.fetchList({
        ParentID: selectedKeys[0],
        // CurrentPage: Org.pagination.current,
        // PageSize: Org.pagination.pageSize,
        ...orderData,
      });
    }

    this.setState(({expandedKeys})=>{
      let key;
      if(selectedKeys.length===0){
        key=info.node.props.eventKey
      }
      else{
        key=selectedKeys[0];
      }
      let index=expandedKeys.indexOf(key);
      if(index>-1){
        expandedKeys.splice(index,1);
      }
      else{
        expandedKeys.push(key);
      }

      return{
        expandedKeys,
      };
    });
  }

    //展开/收起节点时触发
    onExpand=(expandedKeys, info)=>{
      this.setState({
        expandedKeys,
      });
    }

  // 设置模态框显示/隐藏
  setModalVisible = (modalVisible) => {
    this.setState({
      modalVisible,
    });
  }

  // 新建
  handleNew = () => {
    this.setModalVisible(true);
  }

  // 修改
  handleEdit = () => {
    const { Org } = this.props;

    Org.fetchDetail().then(() => {
      Org.setCurrentForm(Org.currentDetail);
      this.setModalVisible(true);
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }
  
  // 清空选中条目
  cleanSelectedKeys = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { Org } = this.props;

    Org.setData({
      selectedRowKeys: [],
    });
  }

  // 批量删除选中条目
  handleRemoveChecked = () => {

    const { Org } = this.props;
    
    confirm({
      title: `确认要删除这 ${Org.selectedRowKeys.length} 条记录吗?`,
      content: '',
      onOk: () => {
        this.handleRemove(Org.selectedRowKeys);
      },
    });
  }

  // 删除
  handleRemove = (Params) => {
    const { Org } = this.props;

    Org.remove({
      Params,
    }).then(() => {
      message.success('删除成功');
      // 在选中条目中清除已经删除的
      Org.setData({
        selectedRowKeys: Org.selectedRowKeys.filter(item => (Params.indexOf(item) === -1)),
      });
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }

  handleTableChange = (pagination, filters, sorter) => {
    // console.log('pagination', pagination);
    // console.log('filters', filters);
    // console.log('sorter', sorter);
  }

  // 勾选
  onSelectionChange = (selectedRowKeys, selectedRows) => {
    const { Org } = this.props;

    Org.setData({
      selectedRowKeys,
    });
  }

  render() {
    const { Org } = this.props;

    // 关于列的属性
    const columns = {
      FullName: {
        width: 30,
      }, 
      SortCode: {
        width: 20,
      }, 
      CategoryID: {
        width: 20,
        render: (text) => {
          return Org.categoryTextValue.filter(item => item.value.toString() === text.toString())[0].text;
        }
      },
      SerialNumber: {
        width: 20,
      },
      DescInfo: {
        width: 30,
      },
    };

    // 计算鉴权后列表宽度总数
    const totalWidth = Org.authMenuListField.reduce((total, current) => (total + columns[current.SerialNumber].width), 0);

    // 鉴权后的列
    const authColumns = [
      { 
        title: '序号',
        dataIndex: 'NO',
        width: '7%',
        className:'alignCenter', 
        render: (text, row, index) =>(index + 1),
      },
      ...Org.authMenuListField.map((item, index) => {
        let obj = {
          title: item.Name,
          dataIndex: item.SerialNumber,
          key: item.SerialNumber,
          ...columns[item.SerialNumber],
          width: (94 * columns[item.SerialNumber].width/totalWidth).toFixed(0) + '%',
        };

        // 最后一列不设置 width
        if(index === Org.authMenuListField - 1) {
          obj.width = undefined;
        }

        // 排序
        if(item.IsSortFields) {
          obj = {
            ...obj,
            sorter: true, 
            sortOrder: Org.orderField === item.SerialNumber && (Org.isDesc ? 'descend' : 'ascend'),
          };
        }

        return obj;
      }),
    ];

    return (
      <Layout className={styles.layout}>
        <Sider width={220} style={{ height: window.innerHeight - 110, overflowY: 'scroll', overflowX: 'auto', background: '#fff' }}>
          <DisplayTree
            treeList={[{
              id: '0',
              name: '组织机构',
              children: Org.treeList.slice(),
            }]}
            //defaultExpandedKeys={['0']}
            onSelect={this.onSelect}
            selectedKeys={Org.selectedKeys.slice()}
            onExpand={this.onExpand}
            expandedKeys={this.state.expandedKeys}
            autoExpandParent={false}
          />
        </Sider>
        <Content style={{ paddingLeft: 24 }}>
          <OrgToolBar 
            Org={Org}
            handleNew={this.handleNew}
            handleEdit={this.handleEdit}
            handleRemoveChecked={this.handleRemoveChecked}
          />
          <OrgForm
            Org={Org}
            modalVisible={this.state.modalVisible}
            setModalVisible={this.setModalVisible}
          />
          <div className={styles.tableAlert}>
            <Alert
              message={(
                <div>
                  已选择 <a style={{ fontWeight: 600 }}>{Org.selectedRowKeys.length}</a> 项
                  <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }} disabled={Org.selectedRowKeys.length <= 0}>清空</a>
                </div>
              )}
              type="info"
              showIcon
            />
          </div>
          {
            Org.authMenuListField && Org.authMenuListField.length > 0 &&
            <Table 
              bordered
              size="small"
              loading={Org.loading}
              pagination={false}
              dataSource={Org.list.slice()}
              columns={authColumns}
              rowKey="UniqueID"
              onChange={this.handleTableChange}
              rowSelection={{
                selectedRowKeys: Org.selectedRowKeys,
                onChange: this.onSelectionChange,
              }}
              scroll={{ y: window.innerHeight - 293 }}
              onRow={(record) => {
                return {
                  // 点击行执行
                  onClick: () => {
                    const set = new Set(Org.selectedRowKeys);
                    if(set.has(record.UniqueID)) {
                      set.delete(record.UniqueID);
                    } else {
                      set.add(record.UniqueID);
                    }
                    Org.setData({
                      selectedRowKeys: Array.from(set),
                    });
                  },       
                };
              }}
            />
          }
        </Content>
      </Layout>
    );
  }
}
