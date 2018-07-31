var Mock = require('mockjs');

function signin(req, res) {

  res.send(Mock.mock({
    Code: 200,
    Data: {
      Logo: '',
      Token: '279600085CE0799E5905FE156A52315ECEDEC7B3C59228DC70E5C1EC07E4D31698748F9EEA93AF56CB4F876BC91DA0293620E66A2E76DE816709E07BCF0CC048C41758A487A3ECFF4933E9A1890D2E2B3F9CBFA5A2CC35DDA25B433EDD95AF67BE69A261121A95440727852837739A11',
      UserName: '超级管理员',
    },
  }));
}

// 菜单树
function menutree(req, res) {

  res.send(Mock.mock({
    Code: 200,
    Data: [
      {
        id: 1,
        name: '系统管理',
        icon: 'dashboard',
        path: 'system-management',
        hasChildren: true,
        children: [
          {
            id: 11,
            name: '菜单管理',
            path: 'menu',
            hasChildren: false,
          },
          {
            id: 12,
            name: '系统日志',
            path: 'log',
            hasChildren: true,
            children: [
              {
                id: 121,
                name: '操作日志',
                path: 'operation-log',
                hasChildren: false,
              },
              {
                id: 122,
                name: '异常日志',
                path: 'exception-log',
                hasChildren: false,
              },
            ]
          },
          {
            id: 13,
            name: '代码管理',
            path: 'code',
            hasChildren: false,
          },
          {
            id: 14,
            name: '行政地区',
            path: 'administrative-area',
            hasChildren: false,
          },
        ],
      },
      {
        id: 2,
        name: '组织管理',
        icon: 'dashboard',
        path: 'org-management',
        hasChildren: true,
        children: [
          {
            id: 21,
            name: '机构类别',
            path: 'org-category',
            hasChildren: false,
          },
          {
            id: 22,
            name: '机构管理',
            path: 'org',
            hasChildren: false,
          },
          {
            id: 23,
            name: '角色管理',
            path: 'role',
            hasChildren: false,
          },
          {
            id: 24,
            name: '用户管理',
            path: 'user',
            hasChildren: false,
          },
        ],
      },
    ],
  }));
}

function menuButton(req, res) {

  res.send(Mock.mock({
    "Code": 200,
    "Data": [{
      "id": "l-new",
      "name": "新建",
      "icon": "plus",
      "hasChildren": false
    }, {
      "id": "l-edit",
      "name": "编辑",
      "icon": "edit",
      "hasChildren": false
    }, {
      "id": "l-delete",
      "name": "删除",
      "icon": "delete",
      "hasChildren": false
    }, {
      "id": "l-more",
      "name": "更多",
      "hasChildren": true,
      "children": [{
        "id": "l-role",
        "name": "角色",
        "hasChildren": false
      }, {
        "id": "l-disableUser",
        "name": "禁用",
        "hasChildren": false
      }, {
        "id": "l-enableUser",
        "name": "启用",
        "hasChildren": false
      }, {
        "id": "l-resetPwd",
        "name": "重置密码",
        "hasChildren": false
      }, {
        "id": "l-member",
        "name": "角色成员",
        "hasChildren": false
      }, {
        "id": "l-auth",
        "name": "角色授权",
        "hasChildren": false
      }]
    }]
  }));
}

function menuList(req, res) {

  res.send(Mock.mock({
    "Code": 200,
    "Data": [{
      "Menu_ID": 0,
      "Name": "登录名",
      "Number": "LoginName",
      "IsSortFields": false,
      "SortCode": 0,
      "UniqueID": 8,
      "MenuID": 0
    }, {
      "Menu_ID": 0,
      "Name": "姓名",
      "Number": "FullName",
      "IsSortFields": false,
      "SortCode": 0,
      "UniqueID": 9,
      "MenuID": 0
    }, {
      "Menu_ID": 0,
      "Name": "工号",
      "Number": "JobNumber",
      "IsSortFields": false,
      "SortCode": 0,
      "UniqueID": 10,
      "MenuID": 0
    }, {
      "Menu_ID": 0,
      "Name": "状态",
      "Number": "UserStatus",
      "IsSortFields": true,
      "DefaultSortingMethod": 1,
      "SortCode": 0,
      "UniqueID": 11,
      "MenuID": 0
    }, {
      "Menu_ID": 0,
      "Name": "手机",
      "Number": "MobilePhone",
      "IsSortFields": false,
      "SortCode": 0,
      "UniqueID": 12,
      "MenuID": 0
    }, {
      "Menu_ID": 0,
      "Name": "角色",
      "Number": "RoleName",
      "IsSortFields": false,
      "SortCode": 0,
      "UniqueID": 13,
      "MenuID": 0
    }, {
      "Menu_ID": 0,
      "Name": "注册日期",
      "Number": "CreatedTime",
      "IsSortFields": true,
      "DefaultSortingMethod": 1,
      "SortCode": 0,
      "UniqueID": 14,
      "MenuID": 0
    }]
  }));
}


module.exports = {
  signin,
  menutree,
  menuButton,
  menuList,
}