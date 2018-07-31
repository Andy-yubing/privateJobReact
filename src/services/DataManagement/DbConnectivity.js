import request from '@/utils/request';

const api = window.PUBLIC_ENV_CONFIG.API;

export function download(params) {
  return request({
    url: `${api}/DataManagement/DbConnectivity/Download`,
    params,
  });
}

export function testList(params) {
  return request({
    url: `${api}/DataManagement/DbConnectivity/Test1`,
    method: 'post',
    data: params,
  });
}
export function testForm(params) {
  return request({
    url: `${api}/DataManagement/DbConnectivity/Test2`,
    method: 'post',
    data: params,
  });
}

export function insert(params) {
  return request({
    url: `${api}/DataManagement/DbConnectivity/Insert`,
    method: 'post',
    data: params,
  });
}

export function update(params) {
  return request({
    url: `${api}/DataManagement/DbConnectivity/Update`,
    method: 'post',
    data: params,
  });
}

export function remove(params) {
  return request({
    url: `${api}/DataManagement/DbConnectivity/Delete`,
    method: 'post',
    data: params,
  });
}

export function queryList(params) {
  return request({
    url: `${api}/DataManagement/DbConnectivity/List`,
    params,
  });
}

export function queryDetail(params) {
  return request({
    url: `${api}/DataManagement/DbConnectivity/Detail`,
    params,
  });
}