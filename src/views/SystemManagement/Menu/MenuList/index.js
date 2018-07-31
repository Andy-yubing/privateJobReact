import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Layout, Button, Table, Divider, Modal, message } from 'antd';

import MenuListForm from './form';
import BatchNewForm from './batchform'
import styles from './index.less';


const { Content } = Layout;
const { confirm } = Modal;

@inject('menuList', 'menu')
@observer
export default class MenuList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      modalBatchVisible:false,
    }
  }
  //批量新建回调入库
  handleBatchNewCallback=(data)=>{
    this.setState({
      modalBatchVisible:false,
    });

    const { menuList,menu } = this.props;
    //const menuid=menu.currentForm.UniqueID.value;
    let _val={};
    //_val.MenuID=menuid;
    _val.List=[];
    data.forEach((e,i)=>{
      let _data={};
      _data.Name=e.Caption;
      _data.SerialNumber=e.Name;
      _data.IsSortFields=false;
      _val.List[_val.List.length]=_data;
    });
  
    menuList.batchCommit(_val).catch((e)=>{
      message.error(`操作失败：${e.Message}`);
    });
  }

  // StepModal 组件调用方法
  handleNextStep = (callback) => {
    callback();
  }

  componentWillMount() {
    const { menuList } = this.props;
    menuList.reset();
  }

  componentDidMount() {
    const { menuList } = this.props;    
    menuList.refreshList();
  }

  componentWillUnmount() {
    const { menuList } = this.props;
    menuList.reset();
  }


  // 设置模态框显示/隐藏
  setModalVisible = (modalVisible,modalBatchVisible=false) => {
    this.setState({
      modalVisible,
      modalBatchVisible,
    });
  }

  // 新建
  handleNew = () => {
    this.setModalVisible(true,false);
  }

  //批量新建
  handleBatchNew=()=>{
    this.setModalVisible(false,true);
  }

  // 修改
  handleEdit = (record) => {
    const { menuList } = this.props;

    menuList.fetchDetail({
      UniqueID: record.UniqueID,
    }).then(() => {
      this.setModalVisible(true);
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });

  }

  // 删除
  handleRemove = (Params) => {
    const { menuList } = this.props;

    menuList.remove({
      Params,
    }).then(() => {
      message.success('删除成功');
    }).catch((e) => {
      message.error(`操作失败：${e.Message}`);
    });
  }

  render() {
    const { menuList, menu } = this.props;

    const columns = [{
      title: '名称',
      dataIndex: 'Name',
      key: 'Name',
      width: 120,
    }, {
      title: '编号',
      dataIndex: 'SerialNumber',
      key: 'SerialNumber',
      width: 120,
    }, {
      title: '排序代码',
      dataIndex: 'SortCode',
      key: 'SortCode',
      width: 120,
    }, {
      title: '操作',
      key: 'Action',
      width: 120,
      render: (text, record) => (
        <span>
          <a
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this.handleEdit(record);
            }}
          >编辑
          </a>
          {
            !(record.hasChildren && record.children && record.children.length > 0) &&
            <span>
              <Divider type="vertical" />
              <a
                onClick={(e) => {
                  confirm({
                    title: "确认要删除这条记录吗？",
                    content: '',
                    onOk: () => {
                      this.handleRemove([record.UniqueID]);
                    },
                  });
                }}
              >删除
              </a>
            </span>
          }
          
        </span>
      ),
    }];

    return (
      <Layout className={styles.layout}>
        <Content style={{ paddingLeft: 30, paddingRight: 30 }}>
          <div className={styles.toolbar}>
            <Button
              icon="plus"
              onClick={this.handleNew}
              loading={menuList.newBtnLoading}
            >新建</Button>
            <Button
              icon="plus"
              onClick={this.handleBatchNew}
              loading={menuList.newBtnLoading}
            >批量新建</Button>
            <MenuListForm
              menuButton={menuList}
              menu={menu}
              modalVisible={this.state.modalVisible}
              setModalVisible={this.setModalVisible}
            />
            <BatchNewForm
              modalVisible={this.state.modalBatchVisible}
              setModalVisible={this.setModalVisible}
              callback={this.handleBatchNewCallback}
            />
          </div>
          <Table
            bordered
            size="small"
            loading={menuList.loading}
            pagination={false}
            dataSource={menuList.list.slice()}
            columns={columns}
            rowKey="UniqueID"
            onChange={this.handleTableChange}
            scroll={{ y: 206 }}
          />
        </Content>
      </Layout>
    );
  }
}
