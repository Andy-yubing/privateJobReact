import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Layout, Radio,DatePicker ,Table, Modal, message, Alert } from 'antd';
import moment from 'moment';

import styles from './index.less';
import WarningViewToolBar from './toolBar';


const RadioGroup = Radio.Group;

const { Header , Content } = Layout;

const { confirm } = Modal;
const api = window.PUBLIC_ENV_CONFIG.API;

//全局配置message的显示位置、时长、最大显示数
message.config({
  top: 240,//消息距离顶部的位置
  duration: 3,//默认自动关闭延时，单位秒
  maxCount: 3,//最大显示数, 超过限制时，最早的消息会被自动关闭
});



// @inject('WarningView')
// @observer
export default class WarningView extends Component {
  
  render() {
    const radioStyle = {
      display: 'block',
      weight: '100px',
    };
    
    return (
      <Layout className={styles.layout}>
      <Header Height={250}  style={{ background: '#fff' }}>
     
      <RadioGroup onChange={this.onChange} value={this.state.value}>
      <Radio style={radioStyle} value={1}>24小时</Radio>
      <Radio style={radioStyle} value={2}>3天</Radio>
      <Radio style={radioStyle} value={3}>7天</Radio>
      <Radio style={radioStyle} value={4}>
      15天
        {/* More...
        {this.state.value === 4 ? <Input style={{ width: 100, marginLeft: 10 }} /> : null} */}
      </Radio>
      <Radio style={radioStyle} value={5}>30天</Radio>
    </RadioGroup>
      <WarningViewToolBar
        />
      
        </Header>

        <Content>
       
        </Content>
      </Layout>
    );
  }
}
