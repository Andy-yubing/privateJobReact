
const context = require.context('./', true, /\.js$/);
//console.log(context.keys())
const keys = context.keys().filter(item => item !== './index.js');
let stores = {};

keys.forEach(key => {
  const pathArr = key.split(/[.//]/);
  const name = pathArr[pathArr.length-2];
  stores[name] = context(key).default;
});
//  console.log(stores)
export default stores;