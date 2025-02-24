// detail.js
const data = require('../../utils/data.js');

Page({
  data: {
    dish: {},  // 用于存储菜品详细信息
  },

  onLoad: function (options) {
    const dishId = options.id;
    console.log(dishId);
    const dish = data.getMenuItems().find(item => item.id === Number(dishId));
    if (dish) {
      this.setData({
        dish: dish,
      });
    } else {
      wx.showToast({
        title: '菜品未找到',
        icon: 'none',
      });
    }
  },

  // 加入购物车按钮点击事件
  onAddToCart: function () {
    console.log('加入购物车按钮点击处理：');
  
    // 获取当前菜品的信息
    const dish = this.data.dish;
    
    if (dish) {
      // 获取购物车中的菜品数据
      const cart = wx.getStorageSync('cartItems') || [];
      
      // 检查菜品是否已经存在于购物车中
      const existingItem = cart.find(item => item.id === dish.id);  // 查找菜品在购物车中的位置
      
      if (existingItem) {
        // 如果菜品已存在，更新数量
        existingItem.quantity += 1;
      } else {
        // 如果菜品不在购物车中，添加新的菜品到购物车，并设定数量为1
        cart.push({ ...dish, quantity: 1 });
      }
  
      // 更新购物车数据
      wx.setStorageSync('cartItems', cart);  // 将更新后的购物车数据存入本地存储
      
      wx.showToast({
        title: '已加入购物车',
        icon: 'success',
      });
  
      // 更新页面中的购物车数据
      this.setData({
        cart: cart
      });
    }
  }
});