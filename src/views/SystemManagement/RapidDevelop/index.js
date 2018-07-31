import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Layout, Button } from 'antd';

import StepPage from '@/components/StepPage';
import TableView from './TableView';
import BaseConfig from './BaseConfig';
import FieldSet from './FieldSet';

import styles from './index.less';

const { Content } = Layout;

@inject('RapidDevelop', 'currentUser')
@observer
export default class RapidDevelop extends Component {

  componentWillMount() {
    const { RapidDevelop } = this.props;
    RapidDevelop.reset();
  }

  render() {
    const { RapidDevelop, currentUser } = this.props;

    const steps = [{
      title: '选择数据表',
      component: TableView,
      // 组件被Form.create()等包裹
      isWrappedComponent: false, 
      props: {
        RapidDevelop,
        currentUser,
      },
      init: () => {
        RapidDevelop.reset();
      },
      afterClose: () => {
        RapidDevelop.reset();
      }
    }, {
      title: '基本配置',
      component: BaseConfig,
      isWrappedComponent: true,
      props: {
        RapidDevelop,
      },
    }, {
      title: '字段设置',
      component: FieldSet,
      isWrappedComponent: false,
      props:{
        RapidDevelop,
      }
    }
    // ,{
    //   title: '查看代码',
    //   component: Button,
    //   isWrappedComponent: false,
    //   // props: {
    //   //   menu,
    //   // },
    // }
    , {
      title: '自动创建',
      component: Button,
      isWrappedComponent: false,
      // props: {
      //   menu,
      // },
    }];
    return (
      <Layout className={styles.layout}>
        <Content>
          <StepPage steps={steps} />
        </Content>
      </Layout>
    );
  }
}
