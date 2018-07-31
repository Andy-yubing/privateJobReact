import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Chart, Geom, Axis, Tooltip, Legend, Coord } from 'bizcharts';

import { Layout, Table, Modal, message, Alert } from 'antd';
import { DataSet } from '@antv/data-set';

import styles from '../charts.less';

import { Label } from 'bizcharts';



const { Sider , Content } = Layout;
const { confirm } = Modal;
const api = window.PUBLIC_ENV_CONFIG.API;



export default class TestIndex extends Component {
  constructor(props) {
    super(props);
  }


// 渲染图表
render() {
  const titlex = {
    //autoRotate: true, // 是否需要自动旋转，默认为 true
    //offset: 50, // 设置标题 title 距离坐标轴线的距离
    textStyle: {
    fontSize: '12',
    //textAlign: 'center',
    fill: '#000',
    //fontWeight: 'bold',
    //rotate: {70:0}//角度
    }, // 坐标轴文本属性配置
    position:'center', // 标题的位置，start、center、end
  }

//#region 柱图
  // 数据源
  const data_1 = [
    { genre: '无效卡倒卡', sold: 275, income: 2300 },
    { genre: '换货倒卡', sold: 115, income: 667 },
    { genre: '套牌同向倒卡', sold: 120, income: 982 },
    { genre: '套牌相向倒卡', sold: 350, income: 5271 }
  ];

  // 显示名称
  const cols_1 = {
    sold: { alias: '数量' },
    genre: { alias: '逃费类型' }
  }; 
//#endregion

//#region 饼图
const { DataView } = DataSet;
        const data_4 = [
          { item: '事例一', count: 40 },
          { item: '事例二', count: 21 },
          { item: '事例三', count: 17 },
          { item: '事例四', count: 13 },
          { item: '事例五', count: 9 }
        ];
        const dv_4 = new DataView();
        dv_4.source(data_4).transform({
          type: 'percent',
          field: 'count',
          dimension: 'item',
          as: 'percent'
        });
        const cols_4 = {
          percent: {
            formatter: val => {
              val = (val * 100) + '%';
              return val;
            }
          }
        }
//#endregion

//#region 柱图+折线
  //数据源
  const data_2 = [
    { 时间: '10:10',  等待: 2, 人员: 2 },
    { 时间: '10:15',  等待: 6, 人员: 3 },
    { 时间: '10:20',  等待: 2, 人员: 5 },
    { 时间: '10:25',  等待: 9, 人员: 1 },
    { 时间: '10:30',  等待: 2, 人员: 3 },
    { 时间: '10:35',  等待: 2, 人员: 1 },
    { 时间: '10:40',  等待: 1, 人员: 2 }
    ];

  //显示名称
  const scale_2 = {
      人员: { min: 0},
      等待: { min: 0}
  }

    let chartIns_2 = null;
  //#endregion

  //region 折叠柱图
  const data_3 = [
    { name:'伦敦', '一月': 18.9, '二月': 28.8, '三月' :39.3, '四月': 81.4, '五月': 47, '六月': 20.3, '七月': 24, '八月': 35.6 },
    { name:'柏林', '一月': 12.4, '二月': 23.2, '三月' :34.5, '四月': 99.7, '五月': 52.6, '六月': 35.5, '七月': 37.4, '八月': 42.4}
  ];
  const ds_3 = new DataSet();
  const dv_3 = ds_3.createView().source(data_3);
  dv_3.transform({
    type: 'fold',
    fields: [ '一月','二月','三月','四月','五月','六月','七月','八月' ], // 展开字段集
    key: '月份', // key字段
    value: '月均降雨量', // value字段
  });
  //endregion

  return (
   <Layout >
     <Content className={styles.newcontentclass}>
    <div>
       <div className={styles.divclass}>
      <Chart width={450} height={300} padding={[40,10,80,80]} data={data_1} scale={cols_1} 	>
        <Axis name="genre" title={titlex} />
        <Axis name="sold"  title={titlex} />
        <Legend position="top"  />
        <Tooltip />
        <Geom type="interval" position="genre*sold" color="genre" />
      </Chart>
       </div>

       <div className={styles.divclass}>
       <Chart height={window.innerHeight} data={dv_4} scale={cols_4} padding={[ 80, 100, 80, 80 ]} forceFit>
            <Coord type='theta' radius={0.75} />
            <Axis name="percent" />
            <Legend position='bottom'  />
            <Tooltip 
              showTitle={false} 
              itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
              />
            <Geom
              type="intervalStack"
              position="percent"
              color='item'
              tooltip={['item*percent',(item, percent) => {
                percent = percent * 100 + '%';
                return {
                  name: item,
                  value: percent
                };
              }]}
              style={{lineWidth: 1,stroke: '#fff'}}
              >
              <Label content='percent' formatter={(val, item) => {
                  return item.point.item + ': ' + val;}} />
            </Geom>
          </Chart>
      </div>
       <div className={styles.divclass}  width={500}>
       <Chart width={450} height={300}  scale={scale_2} forceFit data={data_2} onGetG2Instance={(chart)=>{chartIns_2=chart;}}>
          <Legend
              custom={true}
              allowAllCanceled={true}
          items={[
            { value: '等待', marker: {symbol: 'square', fill: '#3182bd', radius: 5} },
            { value: '人员', marker: {symbol: 'hyphen', stroke: '#ffae6b', radius: 5, lineWidth: 3} }
          ]}
          onClick={ ev => {
            const item = ev.item;
            const value = item.value;
            const checked = ev.checked;
            const geoms = chartIns_2.getAllGeoms();
            for (let i = 0; i < geoms.length; i++) {
              const geom = geoms[i];
              if (geom.getYScale().field === value) {
                if (checked) {
                  geom.show();
                } else {
                  geom.hide();
                }
              }
            }
            }}
          />
          <Axis name="人员"  grid={null}
              label={{
              textStyle:{ fill: '#fdae6b' }
            }}
          />
          <Tooltip />
            <Geom type="interval" position="时间*等待" color="#3182bd"/>
            <Geom type="line" position="时间*人员" color="#fdae6b" size={3} shape="smooth" />
            <Geom type="point" position="时间*人员" color="#fdae6b" size={3} shape="circle" />
          </Chart>
       </div>

        <div className={styles.divclass}>
        <Chart height={400}  padding={[40,10,100,80]} data={dv_3} forceFit>
            <Legend />
            <Axis name="月份" title={titlex} />
            <Axis name="月均降雨量" title={titlex} />
            <Tooltip />
            <Geom type='intervalStack' position="月份*月均降雨量" color={'name'} style={{stroke: '#fff',lineWidth: 1}} />
          </Chart>
        </div>
        </div>
     </Content>
   </Layout>
    );
  }
}//classend