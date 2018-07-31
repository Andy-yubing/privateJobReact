import request from '../utils/request';

const api = window.PUBLIC_ENV_CONFIG.API;

// 登录
export function login(params) {
  return request({
    url: `${api}/Login/SignIn`,
    method: 'post',
    data: params,
  });
}


// 获取序列号
export function getSerialNumber(params) {
  return request({
    url: `${api}/Login/SerialNumber`,
    params,
  });
}


// 提交许可证号
export function setLicense(params) {
  return request({
    url: `${api}/Login/SetLicense`,
    method:'post',
    data:params,
  });
}
