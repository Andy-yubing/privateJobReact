import React, { Component } from 'react';
import {Upload,Avatar,message } from 'antd';
import logo from '@/assets/logo-headere47d5.png';
import request from '@/utils/request';
import {  observer } from 'mobx-react';

const Dragger = Upload.Dragger;
const api = window.PUBLIC_ENV_CONFIG.API;

@observer
export default class UserAvatar extends Component{
    //自定义上传
    handleUpload=(e)=>{
      const { currentUser } = this.props;
      const formData = new FormData();

      formData.append('file', e.file);

      request({
        url: `${api}/OrgManagement/User/UploadAvatar`,
        method: 'post',
        data: formData,
      }).then((e)=>{
        if(e.Code===200)
        {
          currentUser.setData({
            ...currentUser,
            currentUser:{
              ...currentUser.currentUser,
              Logo:e.Data
            }
          });
          message.success('上传成功');
        }
      });
    }

  render(){
    const { currentUser } = this.props;
    const props = {
      accept:'image/*',
      showUploadList:false,
      multiple:false,
      name: 'file',
      customRequest:this.handleUpload,
    };

    return(
    <div>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          {
            currentUser.currentUser.Logo.length===0 ?
            <img alt='404' width={120} height={120}  src={logo}/>
            :
            <Avatar icon='user' style={{width:120,height:120}} src={`${api}/Images/UserAvatar/${currentUser.currentUser.Logo}`}/>
          }
        </p>
        <p className="ant-upload-text">把文件拖入指定区域，完成上传，同样支持点击上传。</p>
        <p className="ant-upload-text">建议上传图片尺寸为120x120，大小不超过2M。</p>
      </Dragger>
    </div>
    );
  }
}