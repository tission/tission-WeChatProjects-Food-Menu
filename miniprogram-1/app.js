const { getFormattedDate } = require('./utils/data.js');  // 引入 getFormattedDate 函数

App({
  onLaunch: function () {
    // 小程序初始化时调用
    console.log('小程序启动');

    // 从本地存储获取菜品数据
    let menuItems = wx.getStorageSync('menuItems');
    // console.log(menuItems);  // 检查 menuItems 的内容
    if (!menuItems || menuItems.length === 0) {
      // 如果本地没有菜品数据，使用初始数据填充
      const initialData = [
        {
          id: 1,
          name: '宫保鸡丁',
          image: '/images/guobaodiding.jpg',
          category: '荤菜',
          ingredients: [
            { name: '鸡肉', quantity: 300, unit: '克' },
            { name: '干辣椒', quantity: 50, unit: '克' },
            { name: '花生', quantity: 30, unit: '克' },
          ],
          flavor: '香辣',
          preparationSteps: [
            '将鸡肉切丁，干辣椒剪段，花生炒熟。',
            '热锅凉油，先炒鸡肉，再加入干辣椒和花生一起翻炒。',
            '加入调料，翻炒均匀，装盘。',
          ],
          createdDate: getFormattedDate(),  // 创建日期格式化为 yyyy-MM-dd
        },
     ];

      try {
        wx.setStorageSync('menuItems', JSON.stringify(initialData)); // 尝试存储数据
        console.log('数据存储完成');  // 存储完成后的输出
      } catch (e) {
        console.error('数据存储失败：', e);  // 如果存储失败，输出错误信息
      }
    } else {
      console.log('本地已有菜品数据，未进行更新');
       // 如果已经有数据，可以将其转换为对象进行使用
       menuItems = JSON.parse(menuItems);  // 确保读取的数据是数组对象
      //  console.log('本地存储的菜品数据：', menuItems);  // 打印读取的数据
    }
  },

  onShow: function () {
    // 小程序展示时调用
    console.log('小程序展示');
  },

  onHide: function () {
    // 小程序隐藏时调用
    console.log('小程序隐藏');
  },

  onError: function (msg) {
    // 错误处理
    console.log('错误信息：', msg);
  }
});