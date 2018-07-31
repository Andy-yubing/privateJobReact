import request from '@/utils/request';

const api = window.PUBLIC_ENV_CONFIG.API;

export function queryDbList(params) {
  return request({
    url: `${api}/DataManagement/DbConnectivity/List`,
    params,
  });
}

export function queryTVList(params) {
  return request({
    url: `${api}/SysManagement/RapidDevelop/TVList`,
    params,
  });
}

export function queryFieldList(params) {
  return request({
    url: `${api}/SysManagement/RapidDevelop/FieldList`,
    params,
  });
}

// 菜单树-功能名称下拉框数据
export function queryMenuTree() {
  return request({
    url: `${api}/SysManagement/Menu/tree`,
  });
}

//提交所有数据，生成代码
export function generateCode(params) {
  return request({
    url: `${api}/SysManagement/RapidDevelop/GenerateCode`,
    method: 'post',
    data: params,
  });
}