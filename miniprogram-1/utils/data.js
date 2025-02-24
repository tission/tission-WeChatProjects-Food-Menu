// utils/data.js

// 获取当前日期，格式化为 yyyy-MM-dd
const getFormattedDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');  // 月份从0开始，所以要加1
  const day = String(date.getDate()).padStart(2, '0');  // 确保是两位数字
  return `${year}-${month}-${day}`;
};

// 从本地存储获取菜品数据
let getMenuItems = () => {
  const menuItems = wx.getStorageSync('menuItems');
  return menuItems ? JSON.parse(menuItems) : [];  // 返回存储的菜品数据或空数组
};

// 通过ID获取特定菜品
let getMenuItemById = (id) => {
  const menuItems = getMenuItems();
  return menuItems.find(item => item.id === Number(id));  // 强制转换id为数字
};

// 更新本地存储中的菜品数据
let setMenuItems = (menuItems) => {
  wx.setStorageSync('menuItems', JSON.stringify(menuItems));  // 将菜品数据存储到本地
};

// 添加新菜品
function addMenuItem(item) {
  let menuItems = getMenuItems();
  // 如果已有数据，确保新菜品的 id 唯一
  if (menuItems.length > 0) {
    const maxId = Math.max(...menuItems.map(i => i.id));
    item.id = maxId + 1; // 为新菜品分配一个唯一的 id
  } else if (!item.id) {
    item.id = 1; // 如果是第一个菜品且没有 id，则设为 1
  }
  menuItems.push(item);
  setMenuItems(menuItems);
}

// 更新菜品信息
function updateMenuItem(id, updatedDish) {
  console.log('updateMenuItem');
  let menuItems = getMenuItems();  // 获取本地存储中的菜品数据
  const index = menuItems.findIndex(item => item.id === Number(id));  // 强制转换id为数字进行比较
  console.log('菜品索引:', index);  // 输出菜品索引
  if (index !== -1) {
    // 如果找到对应菜品，更新其内容
    menuItems[index] = { ...menuItems[index], ...updatedDish, updateDate: getFormattedDate() };  // 合并更新的数据
    setMenuItems(menuItems);  // 更新本地存储中的菜品数据
    console.log('更新成功');
  } else {
    console.error('菜品未找到，更新失败');
  }
}

// 删除指定 ID 的菜品，并重新编号
function deleteMenuItem(id) {
  let menuItems = getMenuItems();  // 获取本地存储中的菜品数据
  menuItems = menuItems.filter(item => item.id !== id);  // 删除指定的菜品

  // 重新编号
  menuItems.forEach((item, index) => {
    item.id = index + 1;  // 从 1 开始重新编号
  });

  setMenuItems(menuItems);  // 更新本地存储中的数据
}

// 获取购物车数据
let cart = [];

// 获取购物车数据
function getCart() {
  return cart;
}

// 更新购物车数据
function setCart(newCart) {
  cart = newCart;
}

// 添加菜品到购物车
function addToCart(dish) {
  const existingItem = cart.find(item => item.id === dish.id);
  if (existingItem) {
    existingItem.quantity += 1;  // 如果菜品已经在购物车中，则数量加1
  } else {
    cart.push({ ...dish, quantity: 1 });  // 如果菜品不在购物车中，则添加到购物车
  }
  setCart(cart);  // 更新购物车
}

module.exports = {
  getFormattedDate,
  getMenuItems,
  setMenuItems,
  getCart,
  setCart,
  addToCart,
  deleteMenuItem,  // 删除菜品
  getMenuItemById,  // 获取单个菜品
  updateMenuItem,   // 更新菜品
  addMenuItem, // 新增导出
};