import React, {Component} from 'react';
import { Row, Col, Tabs, Input, Radio } from 'antd';
import styles from "./index.less";
import card1 from "@/assets/carChart/card1.png";
import card2 from "@/assets/carChart/card2.png";
import card3 from "@/assets/carChart/card3.png";
import card4 from "@/assets/carChart/card4.png";
import card5 from "@/assets/carChart/card5.png";
const RadioGroup = Radio.Group;
class AboutUs extends Component {
  state = {
    value: 1,
  }
  onChange = (e) => {
    console.log('radio checked', e.target.value);
    this.setState({
      value: e.target.value,
    });
  }
  render() {
    return ( 
      <div className={styles.carChart}>
        <div className={styles.carChart_right}>
          <div className={styles.carChart_right_top}>
             
          </div>
          <div className={styles.carChart_right_content}>
            <div className={styles.carChart_right_content_padding} style={{ marginTop: '25px' }}>
              <Row gutter={20}>
                <Col span={8}>
                  <span>查询日期:</span>
                  <Input placeholder="查询日期" style={{ width: '70%', marginLeft: '20px' }} />
                </Col>
                <Col span={13}>
                  <RadioGroup className={styles.carChart_Radio} onChange={this.onChange} value={this.state.value}>
                    <Radio value={1}>24小时</Radio>
                    <Radio value={2}>3天</Radio>
                    <Radio value={3}>7天</Radio>
                    <Radio value={4}>15天</Radio>
                    <Radio value={4}>30天</Radio>
                  </RadioGroup>
                </Col>
                <Col span={3}>
                  <button className={styles.carChart_right_content_button}>查询</button>
                </Col>
              </Row>
            </div>
            <div className={styles.carChart_right_content_padding}>
              <Row gutter={35}>
                <Col span={4}>
                  <div className={styles.carChart_right_content_carNum}>
                    <p><i style={{ backgroundColor: "#13c9e8" }}></i>通行车辆 <strong>1200</strong></p>
                    <p><i style={{ backgroundColor: "#fb2942" }}></i>预警车辆 <strong>29</strong></p>
                  </div>
                </Col>
                <Col span={4}>
                  <div className={styles.gutter_box}>
                    <img src={card1} alt=""/>
                     <span>
                      <h5>单车无效卡倒车</h5>
                      <h4>76</h4>
                     </span>
                  </div>
                </Col>
                <Col span={4}>
                  <div className={styles.gutter_box}>
                    <img src={card2} alt="" />
                    <span>
                      <h5>单车无效卡倒车</h5>
                      <h4>76</h4>
                    </span>
                  </div>
                </Col>
                <Col span={4}>
                  <div className={styles.gutter_box}>
                    <img src={card3} alt="" />
                    <span>
                      <h5>单车无效卡倒车</h5>
                      <h4>76</h4>
                    </span>
                  </div>
                </Col>
                <Col span={4}>
                  <div className={styles.gutter_box}>
                    <img src={card4} alt="" />
                    <span>
                      <h5>单车无效卡倒车</h5>
                      <h4>76</h4>
                    </span>
                  </div>
                </Col>
                <Col span={4}>
                  <div className={styles.gutter_box}>
                    <img src={card5} alt="" />
                    <span>
                      <h5>单车无效卡倒车</h5>
                      <h4>76</h4>
                    </span>
                  </div>
                </Col>
              </Row>
            </div>
            <div>
              <Row gutter={20}>
                <Col  span={14}>
                  <h5></h5>
                  <div>
                      
                  </div>
                </Col>
                <Col  span={10}>
                  <h5></h5>
                  <div>col-6</div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AboutUs;