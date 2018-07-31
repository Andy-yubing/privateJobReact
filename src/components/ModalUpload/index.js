import React, { Component } from 'react';
import { Modal, Button,Upload, Icon, message } from 'antd';
import { observer } from 'mobx-react';
import request from '@/utils/request';



/**
 * 组件使用：模态框的上传组件-支持多文件上传
 * 属性：
 *  title 模态框标题
 *  closable 是否显示右上角的关闭按钮 
 *  maskClosable 点击蒙层是否允许关闭
 *  visible 对话框是否可见
 *  confirmLoading 确定按钮 loading
 *  uploadProps-上传组件属性
 *             fileList 已经上传的文件列表（受控）
 *             uploading 是否正在上传中
 *             accept 接受上传的文件类型,
 *             action 	必选参数, 上传的地址
 *             multiple 是否支持多选文件
 */
@observer
class ModalUpload extends Component
{
  constructor(props) {
    super(props);
    this.state = {
      title:props.title,
      closable:props.closable,
      maskClosable:props.maskClosable,
      visible:props.visible,
      confirmLoading:false,
      uploadProps:{
        fileList: [],
        uploading: false,
        accept:props.accept,
        action:'',
        multiple:props.multiple,
        onRemove: (file) => {
          this.setState(({ uploadProps }) => {
            const fList=uploadProps.fileList;
            const index = fList.indexOf(file);
            const newFileList = fList.slice();
            newFileList.splice(index, 1);
            uploadProps.fileList=newFileList;
            return {
              uploadProps,
            };
           });
        },
        beforeUpload: (file) => {
          this.setState(({ uploadProps }) => {
            const fList=uploadProps.fileList;
            const newFileList=[
              ...fList,
              file
            ];
            uploadProps.fileList=newFileList;
            return{
              uploadProps
            }
          });
          return false;
        },
      }
    }
  }

  componentWillReceiveProps(nextProps) { 
    this.setState({
      title:nextProps.title,
      closable:nextProps.closable,
      maskClosable:nextProps.maskClosable,
      visible:nextProps.visible,
      uploadProps:{
        ...this.state.uploadProps,
        action:nextProps.action,
      },
    });
 }

  handleOk = () => {
    this.setState(({ confirmLoading,uploadProps }) => {
      uploadProps.uploading=true;
      return{
        confirmLoading: true,
        uploadProps,
      }
    });

    const  fileList  = this.state.uploadProps.fileList;
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('files[]', file);
    });
    request({
      url: this.state.uploadProps.action,
      method: 'post',
      data: formData,
    }).then((e)=>{
      if(e.Code===200)
      {
        message.success('导入成功');
      }
      this.setState(({visible, confirmLoading,uploadProps }) => {
        uploadProps.fileList=[];
        uploadProps.uploading=false;
        return {
          visible:false,
          confirmLoading:false,
          uploadProps,
        };
      });

      this.props.handleChangeModalUpload(false);
    });
  }

  handleCancel=()=>{
    if(this.state.uploadProps.uploading)
    {
      message.warn('正在上传中...不能关闭窗口');
    }
    else
    {
      this.setState(({ uploadProps,visible }) => {
        uploadProps.fileList=[];
        uploadProps.uploading=false;
        return {
          visible:false,
          uploadProps,
        };
      });

      this.props.handleChangeModalUpload(false);
    }
  }

  render()
  {
    return(<div>
      <Modal title={this.state.title}
          closable={this.state.closable}
          maskClosable={this.state.maskClosable}
          visible={this.state.visible}
          confirmLoading={this.state.confirmLoading}
          okText='上传'
          cancelText='关闭'
          onOk={this.handleOk.bind(this)}
          onCancel={this.handleCancel.bind(this)}
        >
          <div>
            <Upload {...this.state.uploadProps}>
              <Button>
                <Icon type="upload" /> 选择文件
              </Button>
            </Upload>
          </div>
        </Modal>
    </div>);
  }
}

export default ModalUpload;