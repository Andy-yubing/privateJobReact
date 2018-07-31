import asyncComponent from '../components/AsyncComponent';


/* 本项目路由不使用嵌套结构 */
/* 如果菜单数据不由接口提供的话可以和路由信息写在一起，比如 name 等属性 */
 const config = [
  {
    path: 'SystemManagement/Menu',
    /* webpackChunkName 指定打包后模块文件名称，如果省略，webpack 将使用数字作为默认名称 */
    component: asyncComponent(() => import(/* webpackChunkName: "Menu" */ '../views/SystemManagement/Menu')),
    /* 是否严格匹配 */
    exact: true,
  },
  {
    path: 'SystemManagement/Log/OperationLog',
    component: asyncComponent(() => import(/* webpackChunkName: "OperationLog" */ '../views/SystemManagement/OperationLog')),
    exact: true,
  },
  {
    path: 'SystemManagement/Log/ExceptionLog',
    component: asyncComponent(() => import(/* webpackChunkName: "ExceptionLog" */ '../views/SystemManagement/ExceptionLog')),
    exact: true,
  },
  {
    path: 'SystemManagement/Code',
    component: asyncComponent(() => import(/* webpackChunkName: "Code" */ '../views/SystemManagement/Code')),
    exact: true,
  },
  {
    path: 'SystemManagement/Code/:id',
    component: asyncComponent(() => import(/* webpackChunkName: "Code" */ '../views/SystemManagement/Code')),
    exact: true,
  },
  {
    path: 'SystemManagement/AdministrativeArea',
    component: asyncComponent(() => import(/* webpackChunkName: "AdministrativeArea" */ '../views/SystemManagement/AdministrativeArea')),
    exact: true,
  },
  {
    path: 'SystemManagement/RapidDevelop',
    component: asyncComponent(() => import(/* webpackChunkName: "RapidDevelop" */ '../views/SystemManagement/RapidDevelop')),
    exact: true,
  },
  {
    path: 'OrgManagement/OrgCategory',
    component: asyncComponent(() => import(/* webpackChunkName: "OrgCategory" */ '../views/OrgManagement/OrgCategory')),
    exact: true,
  },
  {
    path: 'OrgManagement/Org',
    component: asyncComponent(() => import(/* webpackChunkName: "Org" */ '../views/OrgManagement/Org')),
    exact: true,
  },
  {
    path: 'OrgManagement/Role',
    component: asyncComponent(() => import(/* webpackChunkName: "Role" */ '../views/OrgManagement/Role')),
    exact: true,
  },
  {
    path: 'OrgManagement/User',
    component: asyncComponent(() => import(/* webpackChunkName: "User" */ '../views/OrgManagement/User')),
    exact: true,
  },
  {
    path: 'DataManagement/DbConnectivity',
    component: asyncComponent(() => import(/* webpackChunkName: "DbConnectivity" */ '../views/DataManagement/DbConnectivity')),
    exact: true,
  },
  {
    path: 'DiagnosticPlatform',
    component: asyncComponent(() => import(/* webpackChunkName: "DiagnosticPlatform" */ '../views/CustomService/DiagnosticPlatform')),
    exact: true,
  },
  {
    path: 'PersonalCenter',
    component: asyncComponent(() => import(/* webpackChunkName: "PersonalCenter" */ '../views/PersonalCenter')),
    exact: true,
  },
  {
    path: 'WarningView',
    component: asyncComponent(() => import(/* webpackChunkName: "WarningView" */ '../views/CustomService/AssistInspection/WarningView')),
    exact: true,
  }
];

export default config;