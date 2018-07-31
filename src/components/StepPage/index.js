import React, { Component } from 'react';
import { Button, Steps, message } from 'antd';
import { observer } from 'mobx-react';

import styles from './index.less';

const { Step } = Steps;

/**
 * 组件使用：
 * 属性：
 *  modalVisible 是否显示
 *  setModalVisible 设置是否显示 
 *  title 分步的标题
 *  steps 数据，eg：
 * const steps = [{
 *     title: '系统功能',
 *     component: MenuForm,
 *     // 组件被Form.create()等包裹
 *     isWrappedComponent: true, 
 *     props: {
 *       menu,
 *     },
 *   }, {
 *     title: '系统按钮',
 *     component: MenuForm,
 *     isWrappedComponent: false,
 *     props: {
 *       menu,
 *     },
 *   }];
 * 
 * 组件内需要声明函数：handleNextStep 进入先一步前执行
 * 组件内需要调用函数：goNext 进入下一步
 */
@observer
class StepPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      btnLoading: false,
      current: 0,
    }
  }
  componentWillMount() {
    const { steps } = this.props;
    steps.forEach(item => {
      item.init && item.init();
    });
  }
  componentWillUnmount() {
    const { steps } = this.props;
    steps.forEach(item => {
      item.afterClose && item.afterClose();
    });
  }

  handleNext = () => {
    console.log(this.childNode);
    // 通过 ref 调用子组件的方法
    if(this.childNode.handleNextStep) {
      this.childNode.handleNextStep(this.goNext);
    } else {
      this.goNext();
    }
  }
  handleBack = () => {
    const current = this.state.current - 1;
    this.setState({ current });
  }
  goNext = () => {
    const { steps } = this.props;
    if(this.state.current < steps.length - 1) {
      this.setState({
        current: this.state.current + 1,
      });
    } else {
      message.success('操作完成');
    }
  }
  setChildRef = (node) => {
    this.childNode = node;
  }

  render() {
    const { steps } = this.props;
    const { btnLoading, current } = this.state;
    const { component: ChildComponent, isWrappedComponent } = steps[current];
    // 组件被Form.create()等包裹时使用 wrappedComponentRef 属性，否则使用 ref
    const ref = isWrappedComponent ? {wrappedComponentRef:this.setChildRef} : {ref:this.setChildRef};

    return (
      <div>
        <Steps current={current}>
          {
            steps.map((item, index) => (
              <Step
                key={item.title}
                title={item.title}
                onClick={() => {
                  if(current > index) {
                    this.setState({current: index});
                  }
                }}
              />
            ))
          }
        </Steps>
        <div className={styles.stepContent} style={{height: window.innerHeight - 220}}>
          {
            <ChildComponent
              {
                ...ref
              } 
              {
                ...steps[current].props
              }
            />
          }
        </div>
        <div style={{textAlign: 'center', marginTop: 10}}>
          {
            current > 0 &&
            <Button key="back" style={{ marginRight: 20 }} onClick={this.handleBack}>
              上一步
            </Button>
          }
          <Button key="next" type="primary" loading={btnLoading} onClick={this.handleNext}>
            {
              current < steps.length - 1 ? '下一步' : '完成'
            }
          </Button>
        </div>
        
      </div>
        

    );
  }
}

export default StepPage;