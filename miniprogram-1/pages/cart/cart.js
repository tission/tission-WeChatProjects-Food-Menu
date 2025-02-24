// cart.js
const data = require('../../utils/data.js');

Page({
  data: {
    cartItems: [],
    ingredientsList: [],
    orderDate: '', // 用于保存订单日期
  },

  onLoad: function () {
    this.setData({
      orderDate: this.getFormattedDate()  // 设置订单日期
    });
    // 加载购物车数据
    this.loadCartItems();
  },

  // 获取当前日期，格式化为 yyyy-MM-dd
  getFormattedDate: function () {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 加载购物车中的菜品
  loadCartItems: function () {
    const cartItems = wx.getStorageSync('cartItems') || [];  // 从本地存储获取购物车数据
    this.setData({
      cartItems: cartItems
    });
    this.updateIngredientsList();  // 更新食材清单
  },


  // 更新食材清单
  updateIngredientsList: function () {
    const ingredientsCount = {};

    this.data.cartItems.forEach(item => {
      item.ingredients.forEach(ingredient => {
        // 使用食材名称和单位作为 key
        const key = `${ingredient.name}_${ingredient.unit}`;
        ingredientsCount[key] = (ingredientsCount[key] || 0) + (ingredient.quantity * item.quantity); // 加总相同食材的数量
      });
    });

    // 转换成食材清单格式
    const ingredientsList = Object.keys(ingredientsCount).map(key => {
      const [name, unit] = key.split('_');
      return {
        name: name,
        unit: unit,
        quantity: ingredientsCount[key],
      };
    });

    this.setData({
      ingredientsList: ingredientsList
    });
  },

  // 增加菜品数量
  onIncreaseQuantity: function (e) {
    const id = e.currentTarget.dataset.id;
    const cartItems = this.data.cartItems;
    const item = cartItems.find(item => item.id === id);
    item.quantity += 1;
    this.setData({
      cartItems: cartItems
    });
    this.updateIngredientsList();  // 更新食材清单
    wx.setStorageSync('cartItems', cartItems);  // 保存更新的购物车数据
  },

  // 减少菜品数量
  onDecreaseQuantity: function (e) {
    const id = e.currentTarget.dataset.id;
    const cartItems = this.data.cartItems;
    const item = cartItems.find(item => item.id === id);

    if (item.quantity > 1) {
      // 如果数量大于 1，减少数量
      item.quantity -= 1;
    } else {
      // 如果数量小于等于 1，弹出提示并将数量设为 1
      wx.showToast({
        title: '菜品数量不能为0',
        icon: 'none'
      });
      item.quantity = 1; // 强制将数量调整为 1
    }
  
    // 更新数据并重新计算总价
    this.setData({
      cartItems: cartItems
    });
    this.updateIngredientsList();  // 更新食材清单
    wx.setStorageSync('cartItems', cartItems);  // 保存更新的购物车数据
  },

  // 删除菜品
  onDeleteItem: function (e) {
    const id = e.currentTarget.dataset.id;
    const cartItems = this.data.cartItems.filter(item => item.id !== id);
    this.setData({
      cartItems: cartItems
    });
    this.updateIngredientsList();  // 更新食材清单
    wx.setStorageSync('cartItems', cartItems);  // 保存更新的购物车数据
  },

  // 保存订单信息
  onSaveOrder: function () {
    if (this.data.cartItems.length === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      });
      return;
    }

    const order = {
      orderId: Date.now(),  // 使用时间戳生成订单号
      date: this.data.orderDate,
      items: this.data.cartItems,
    };

    // 获取历史订单并保存新订单
    const history = wx.getStorageSync('orderHistory') || [];
    history.push(order);
    wx.setStorageSync('orderHistory', history);

    wx.showToast({
      title: '订单保存成功',
      icon: 'success'
    });

    // 跳转到历史订单页面
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  // 页面每次显示时重新加载购物车数据
  onShow: function () {
    this.loadCartItems();
  },
});