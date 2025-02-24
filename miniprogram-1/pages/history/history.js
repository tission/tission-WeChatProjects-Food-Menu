const data = require('../../utils/data.js');

Page({
  data: {
    orders: []  // 保存历史订单数据
  },

  onShow: function () {
    this.loadOrders();  // 每次页面显示时重新加载历史订单数据
  },

  // 加载历史订单数据
  loadOrders: function () {
    // 从本地存储中获取最新的历史订单数据
    const orders = wx.getStorageSync('orderHistory') || [];
    
    // 按照订单号降序排列，最新的订单放在最上面
    orders.sort((a, b) => {
      // 假设 orderId 为数字类型，直接按数字大小比较
      return b.orderId - a.orderId;
    });

    this.setData({
      orders: orders
    });
  },

  // 查看订单详情
  onViewOrderDetails: function (e) {
    const orderId = e.currentTarget.dataset.id;
    // 获取当前订单
    const orderIndex = this.data.orders.findIndex(order => order.orderId === orderId);
    if (orderIndex !== -1) {
      const orders = this.data.orders;
      orders[orderIndex].showDetails = !orders[orderIndex].showDetails;  // 切换展开/折叠状态
      this.setData({
        orders: orders
      });
    }
  },

  // 重新下单
  onReorder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    // 获取该订单的菜品信息
    const order = this.data.orders.find(item => item.orderId === orderId);
    if (order) {
      // 将菜品添加到购物车
      const cartItems = order.items.map(item => ({
        ...item,
        quantity: item.quantity || 1
      }));
      // 存储购物车数据
      wx.setStorageSync('cartItems', cartItems);
      // 跳转到购物车页面
      wx.switchTab({
        url: '/pages/cart/cart'
      });
    }
  },

  // 删除订单
  onDeleteOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    const orders = this.data.orders.filter(order => order.orderId !== orderId);
    // 更新本地存储
    wx.setStorageSync('orderHistory', orders);
    this.setData({
      orders: orders  // 更新页面数据
    });
  }
});