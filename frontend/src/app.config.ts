export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/plants/index',
    'pages/plant-detail/index',
    'pages/add-plant/index',
    'pages/care-records/index',
    'pages/logs/index',
    'pages/profile/index',
    'pages/edit-profile/index',
    'pages/category/index'
  ],
  tabBar: {
    color: '#999999',
    selectedColor: '#4CAF50',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/images/home_1.png',
        selectedIconPath: 'assets/images/home.png'
      },
      {
        pagePath: 'pages/plants/index',
        text: '植物',
        iconPath: 'assets/images/plant_1.png',
        selectedIconPath: 'assets/images/plant.png'
      },
      {
        pagePath: 'pages/logs/index',
        text: '日志',
        iconPath: 'assets/images/journal_1.png',
        selectedIconPath: 'assets/images/journal.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/images/profile_1.png',
        selectedIconPath: 'assets/images/profile.png'
      }
    ]
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#E8F5E9',
    navigationBarTitleText: '植物养护记录',
    navigationBarTextStyle: 'black',
    navigationStyle: 'custom'
  }
})
