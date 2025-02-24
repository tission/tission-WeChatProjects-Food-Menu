const data = require('../../utils/data.js');
const { getFormattedDate } = require('../../utils/data.js');  // 引入 getFormattedDate 函数

Page({
  data: {
    imagePath: '',  // 图片路径
    form: {
      name: '',       // 菜品名称
      category: '',   // 菜品类型
      flavor: '',     // 菜品口味
      ingredients: [], // 成分表格
      steps: [],      // 制作步骤
    },
    isEdit: false,  // 是否编辑状态
    dishId: null,   // 菜品ID
  },

  onLoad: function (options) {
    // 判断是新建还是编辑
    if (options.id) {
      this.setData({
        isEdit: true,
        dishId: options.id,
      });
      // 如果是编辑，加载已有菜品数据
      this.loadDishData(options.id);
      console.log('编辑，加载已有菜品数据');
      console.log(options.id);  // 检查 options.id 的内容
    } else {
      console.log('新建，初始化表单');
      // 如果是新建，初始化表单
      this.setData({
        isEdit: false,
        dishId: null,
        imagePath: '',
        'form.name': '',
        'form.category': '',
        'form.flavor': '',
        'form.ingredients': [],
        'form.steps': [],
      });
    }
  },

  // 加载已有菜品数据
  loadDishData: function (id) {
    // const dishId = options.id;
    // const dish = data.getMenuItems().find(item => item.id === Number(dishId));
    const dish = data.getMenuItemById(id);  // 获取指定ID的菜品数据
    if (dish) {
      this.setData({
        imagePath: dish.image,
        'form.name': dish.name,
        'form.category': dish.category,
        'form.flavor': dish.flavor,
        'form.ingredients': dish.ingredients,
        'form.steps': dish.preparationSteps || [], // 使用 preparationSteps 替代 steps
      });
    } else {
      wx.showToast({
        title: '菜品未找到',
        icon: 'none',
      });
    }
  },

  // 处理输入框变化
  onInputChange: function (e) {
    const field = e.currentTarget.dataset.field; // 获取字段名
    const value = e.detail.value;  // 获取输入值
    const form = this.data.form;
    form[field] = value;  // 更新表单数据
    this.setData({
      form: form,
    });
  },

  // 选择图片
  onChooseImage: function () {
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          imagePath: res.tempFilePaths[0],
        });
      },
    });
  },

  // 提交表单
  onSubmit: function (e) {
    const formData = { ...this.data.form, ...e.detail.value };  // 获取表单数据并合并
    const menuItems = data.getMenuItems();

    if (this.data.isEdit) {
      // 编辑时更新菜品
      const updatedDishId = Number(this.data.dishId);
      console.log('提交时的菜品 ID:', updatedDishId);  // 输出正确的 dishId
      formData.preparationSteps = formData.steps || [];  // 确保制作步骤保存在 preparationSteps
      console.log(this.data.dishId);  // 检查 options.id 的内容
      data.updateMenuItem(updatedDishId, formData);  // 更新菜品


      wx.showToast({
        
        title: '更新成功',
        icon: 'success',
      });
    } else {
      // 新建时添加菜品
      if (menuItems.some(item => item.name === formData.name)) {
        wx.showToast({
          title: '菜品已存在',
          icon: 'none',
        });
        return;
      }

      const newDishId = new Date().getTime();  // 生成一个唯一的ID
      formData.id = newDishId;  // 设置新菜品的ID
      formData.image = this.data.imagePath;  // 保存图片路径到新菜品数据
      formData.createdDate = getFormattedDate();  // 自动保存当前日期

      // 确保制作步骤数据存在
      formData.preparationSteps = formData.steps || [];  // 确保保存 steps 到 preparationSteps
      console.log('制作步骤保存在 preparationSteps');
      console.log(formData.preparationSteps);  // 检查 options.id 的内容

      menuItems.push(formData);  // 添加菜品到菜单列表

      // 保存菜品数据到本地存储
      wx.setStorageSync('menuItems', JSON.stringify(menuItems));

      wx.showToast({
        title: '添加成功',
        icon: 'success',
      });
    }
    wx.navigateBack();  // 返回上一页
  },

  // 取消操作，返回上一页
  onCancel: function () {
    wx.navigateBack();
  },


  // 添加成分表格的行
  onAddIngredient: function () {
    const ingredients = this.data.form.ingredients;
    ingredients.push({ name: '', quantity: '', unit: '' });
    this.setData({
      'form.ingredients': ingredients,
    });
  },

  // 编辑成分表格的值
  onEditIngredient: function (e) {
    const index = e.currentTarget.dataset.index;
    const field = e.currentTarget.dataset.field;
    const ingredients = this.data.form.ingredients;
    ingredients[index][field] = e.detail.value;
    this.setData({
      'form.ingredients': ingredients,
    });
  },

  // 删除成分
  onDeleteIngredient: function (e) {
    const index = e.currentTarget.dataset.index;
    const ingredients = this.data.form.ingredients;
    ingredients.splice(index, 1);  // 删除指定行
    this.setData({
      'form.ingredients': ingredients,
    });
  },

  // 编辑制作步骤
  onEditStep: function (e) {
    const index = e.currentTarget.dataset.index;
    const steps = this.data.form.steps || [];  // 确保steps是数组
    if (index >= 0 && index < steps.length) {
      steps[index] = e.detail.value;
      this.setData({
        'form.steps': steps,
      });
    }
  },
  
  // 按下回车时添加新步骤
  onStepInputConfirm: function (e) {
    const value = e.detail.value;
    const steps = this.data.form.steps || [];
    if (value.trim() !== "") {
      steps.push(value);  // 在制作步骤中添加新步骤
      this.setData({
        'form.steps': steps,
      });
    }
  },
  // 添加新的步骤
  onAddStep: function () {
    const steps = this.data.form.steps || [];  // 确保steps是数组
    steps.push('');  // 添加空步骤
    this.setData({
      'form.steps': steps,
    });
  },

  // 选择菜品类型
  onPickerChange: function (e) { 
    const value = e.detail.value;
    this.setData({
      'form.category': ['素菜', '荤菜', '主食', '汤品', '饮品', '其他'][value],
    });
  },
});