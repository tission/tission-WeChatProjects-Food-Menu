const data = require('../../utils/data.js');
const fs = wx.getFileSystemManager();  // 获取文件管理器

Page({
  data: {
    menuItems: [],  // 菜品列表
  },

  onLoad: function () {
    this.loadMenuItems();  // 页面加载时获取并刷新菜单数据
  },

  // 加载并排序菜单项
  loadMenuItems: function () {
    let menuItems = data.getMenuItems();  // 获取本地存储的菜品数据
    menuItems.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    menuItems = menuItems.map((item, index) => {
      item.serialNumber = index + 1;
      return item;
    });
    this.setData({
      menuItems: menuItems,
    });
  },

  // 导出功能
  onExport: function () {
    const menuItems = data.getMenuItems(); // 获取当前菜单数据
    const exportData = menuItems.map(item => ({
      id: item.id,
      name: item.name,
      image: item.image,
      category: item.category,
      ingredients: item.ingredients,
      flavor: item.flavor,
      preparationSteps: item.preparationSteps,
    }));

    const targetFilePath = `${wx.env.USER_DATA_PATH}/menuItems_export.json`;
    console.log('目标文件保存路径：', targetFilePath);

    try {
      fs.writeFileSync(
        targetFilePath,
        JSON.stringify(exportData, null, 2),
        'utf8'
      );
      console.log('文件写入成功，路径：', targetFilePath);

      fs.access({
        path: targetFilePath,
        success: () => {
          console.log('文件存在，导出成功');
          wx.showModal({
            title: '导出成功',
            content: `文件已保存至：${targetFilePath}`,
            showCancel: false,
            confirmText: '确定',
            success: (res) => {
              if (res.confirm) {
                wx.shareFileMessage({
                  filePath: targetFilePath,
                  fileName: 'menuItems_export.json',
                  success: () => {
                    console.log('文件分享成功');
                    wx.showToast({
                      title: '已分享文件',
                      icon: 'success',
                    });
                  },
                  fail: (err) => {
                    console.error('文件分享失败:', err);
                    wx.showToast({
                      title: '分享失败',
                      icon: 'none',
                    });
                  }
                });
              }
            }
          });
        },
        fail: (err) => {
          console.error('文件检查失败:', err);
          wx.showToast({
            title: '导出失败',
            icon: 'none',
          });
        }
      });
    } catch (err) {
      wx.showToast({
        title: '写入失败',
        icon: 'none',
      });
      console.error('文件写入失败:', err);
    }
  },

  // 导入功能
  onImport: function () {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json'],
      success: (res) => {
        const filePath = res.tempFiles[0].path;

        fs.readFile({
          filePath: filePath,
          encoding: 'utf8',
          success: (readRes) => {
            try {
              const importedData = JSON.parse(readRes.data); // 解析 JSON 数据
              const currentMenuItems = data.getMenuItems(); // 获取当前本地数据库中的菜品
              let newItemsAdded = 0; // 计数新增的菜品数量

              // 检查导入的数据是否为数组，如果不是则转换为数组
              const importedItems = Array.isArray(importedData) ? importedData : [importedData];

              importedItems.forEach((item) => {
                // 检查本地数据库中是否已存在相同 id 的菜品
                const exists = currentMenuItems.some(
                  (existingItem) => existingItem.id === item.id
                );

                if (!exists) {
                  item.createdDate = data.getFormattedDate(); // 使用统一的日期格式 yyyy-MM-dd
                  data.addMenuItem(item); // 添加到本地数据库
                  newItemsAdded++;
                }
              });

              // 刷新菜品列表
              this.loadMenuItems();

              // 根据导入结果显示提示
              if (newItemsAdded > 0) {
                wx.showToast({
                  title: `成功导入 ${newItemsAdded} 个新菜品`,
                  icon: 'success',
                });
              } else {
                wx.showToast({
                  title: '没有新菜品导入',
                  icon: 'none',
                });
              }
            } catch (error) {
              // 使用 showModal 显示导入失败的具体原因
              wx.showModal({
                title: '导入失败',
                content: `原因：${error.message || '解析 JSON 数据出错'}`,
                showCancel: false,
                confirmText: '确定',
              });
              console.error('导入错误:', error);
            }
          },
          fail: (err) => {
            // 显示读取文件失败的具体原因
            wx.showModal({
              title: '导入失败',
              content: `原因：读取文件失败 - ${err.errMsg || '未知错误'}`,
              showCancel: false,
              confirmText: '确定',
            });
            console.error('读取文件失败:', err);
          }
        });
      },
      fail: (err) => {
        // 显示选择文件失败的具体原因
        wx.showModal({
          title: '导入失败',
          content: `原因：选择文件失败 - ${err.errMsg || '未知错误'}`,
          showCancel: false,
          confirmText: '确定',
        });
        console.error('选择文件失败:', err);
      }
    });
  },

  // 添加菜品
  onAddDish: function () {
    wx.navigateTo({
      url: '/pages/checkout/checkout',
    });
  },

  // 编辑菜品
  onEditDish: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/checkout/checkout?id=${id}`,
    });
  },

  // 删除菜品
  onDeleteDish: function (e) {
    const id = e.currentTarget.dataset.id;
    data.deleteMenuItem(id);
    this.loadMenuItems();
    wx.showToast({
      title: '删除成功',
      icon: 'success',
    });
  },
});