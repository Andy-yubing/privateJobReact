import request from '@/utils/request';

const api = window.PUBLIC_ENV_CONFIG.API;


export function download(params) {
  return request({
    url: `${api}/DiagnosticPlatform/Download`,
    params,
  });
}

export function queryTree(params) {
  return request({
    url: `${api}/DiagnosticPlatform/Tree`,
    params,
  });
}

export function insert(params) {
  return request({
    url: `${api}/DiagnosticPlatform/insert`,
    method: 'post',
    data: params,
  });
}

export function update(params) {
  return request({
      url: `${api}/DiagnosticPlatform/update`,
    method: 'post',
    data: params,
  });
}

export function remove(params) {
  return request({
      url: `${api}/DiagnosticPlatform/delete`,
    method: 'post',
    data: params,
  });
}

export function queryList(params) {
  return request({
      url: `${api}/DiagnosticPlatform/list`,
    params,
  });
}

export function queryDetail(params) {
  return request({
      url: `${api}/DiagnosticPlatform/detail`,
    params,
  });
}

export function Calculate(params) {
  return request({
    url: `${api}/DiagnosticPlatform/Calculate`,
    method: 'post',
    data: params,
    timeout:0,
  });
}
