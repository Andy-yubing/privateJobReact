import request from '@/utils/request';

const api = window.PUBLIC_ENV_CONFIG.API;

// 菜单树
export function queryMenuTree() {
  return request({
    url: `${api}/SysManagement/Authentication/MenuTree`,
  });
}

export function queryMenuButton(params) {
  return request({
    url: `${api}/SysManagement/Authentication/MenuButton`,
    params,
  });
}

export function queryMenuList(params) {
  return request({
    url: `${api}/SysManagement/Authentication/MenuList`,
    params,
  });
}