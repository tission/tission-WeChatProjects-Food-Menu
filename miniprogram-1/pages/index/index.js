const data = require('../../utils/data.js');

Page({
  data: {
    categories: [
      { id: 0, name: '全部' }, // 添加“全部”分类
      { id: 1, name: '素菜' },
      { id: 2, name: '荤菜' },
      { id: 3, name: '主食' },
      { id: 4, name: '汤品' },
      { id: 5, name: '饮品' },
      { id: 6, name: '其他' },
    ],
    menuItems: [],  // 菜品数据
    searchQuery: '',  // 搜索框的内容
    filteredMenu: [], // 过滤后的菜品
    cart: [],  // 用来存储购物车中的菜品
  },

  onLoad: function () {
    // 页面初始化时加载购物车数据
    this.setData({
      cart: data.getCart(),  // 加载购物车数据
    });
  },

  onShow: function () {
    // 每次进入页面时，重新加载菜单数据
    this.loadMenuItems();
  },

  // 加载菜单项
  loadMenuItems: function () {
    const menuItems = data.getMenuItems();  // 从 data.js 获取菜品数据
    console.log('加载的菜单数据：', menuItems);  // 打印获取到的菜单数据，确保不为空

    this.setData({
      menuItems: menuItems,
      filteredMenu: menuItems,  // 初始显示所有菜单项
    });
  },

  // 处理点击菜品图片事件
  onDishClick: function (e) {
    const id = e.currentTarget.dataset.id; // 获取点击菜品的 id
    // 跳转到菜品详情页面
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`,  // 根据你的页面结构调整路径
    });
  },

  // 处理分类点击
  onCategoryClick: function (e) {
    const category = e.currentTarget.dataset.category;
    if (category === '全部') {
      // 点击“全部”时，显示所有菜单项
      this.setData({
        filteredMenu: this.data.menuItems,
      });
    } else {
      // 根据点击的分类，过滤菜品
      const filteredMenu = this.data.menuItems.filter(item => item.category === category);
      this.setData({
        filteredMenu: filteredMenu,
      });
    }
  },

  // 搜索框输入处理
  onSearchInput: function (e) {
    this.setData({
      searchQuery: e.detail.value
    });
  },

  // 搜索框回车确认处理
  onSearchConfirm: function () {
    const searchQuery = this.data.searchQuery.toLowerCase();
    const filteredItems = this.data.menuItems.filter(item => item.name.toLowerCase().includes(searchQuery));
    this.setData({
      filteredMenu: filteredItems
    });

    if (filteredItems.length === 0) {
      wx.showToast({
        title: '未找到相关菜品',
        icon: 'none'
      });
    }
  },

  // 加入购物车按钮点击处理
  onAddToCart: function (e) {
    console.log('加入购物车按钮点击处理：');
    const itemId = e.currentTarget.dataset.id;  // 获取菜品ID
    const dish = this.data.menuItems.find(item => item.id === itemId);  // 查找菜品信息
  
    if (dish) {
      // 判断菜品是否已经存在于购物车中
      const cart = wx.getStorageSync('cartItems') || [];
      const existingItem = cart.find(item => item.id === itemId);  // 检查菜品是否已经在购物车中
  
      if (existingItem) {
        // 如果菜品已存在，更新数量
        existingItem.quantity += 1;
      } else {
        // 如果菜品不在购物车中，添加新的菜品到购物车，并设定数量为1
        cart.push({ ...dish, quantity: 1 });
      }
  
      wx.setStorageSync('cartItems', cart);  // 更新本地存储的购物车数据
      wx.showToast({
        title: '已加入购物车',
        icon: 'success',
      });
  
      this.setData({
        cart: cart  // 更新页面中的购物车数据
      });
    }
  },
});