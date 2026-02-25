## ADDED Requirements

### Requirement: Hero 区域全屏展示
Hero 区域 SHALL 占据整个视口高度，作为网站的第一视觉焦点。

#### Scenario: 页面加载时
- **WHEN** 用户访问网站首页
- **THEN** Hero 区域占据 100vh 高度
- **AND** 显示背景图片或视频
- **AND** 显示大标题 "荒野刀疤哥"
- **AND** 显示副标题/一句话介绍

### Requirement: 背景视觉
Hero 区域 SHALL 使用全屏背景图片，带有渐变遮罩以保证文字可读性。

#### Scenario: 桌面端查看
- **WHEN** 用户在桌面浏览器访问
- **THEN** 背景图片覆盖整个 Hero 区域
- **AND** 图片上方有从下到上的深色渐变遮罩
- **AND** 遮罩不透明度在 40%-60% 之间

#### Scenario: 移动端查看
- **WHEN** 用户在移动设备访问
- **THEN** 背景图片适配屏幕宽度
- **AND** 保持宽高比，必要时裁剪

### Requirement: 标题样式
主标题 SHALL 使用大号字体，醒目且具有荒野气质。

#### Scenario: 查看标题
- **WHEN** 用户查看 Hero 区域
- **THEN** 主标题 "荒野刀疤哥" 使用 48px-72px 字体大小
- **AND** 字体颜色为白色或米白色 (#F5F0E6)
- **AND** 使用粗体或加粗衬线字体
- **AND** 位于屏幕垂直中心偏下位置

### Requirement: 向下滚动提示
Hero 区域 SHALL 显示一个滚动提示，引导用户向下浏览。

#### Scenario: 页面加载完成
- **WHEN** 页面加载完成
- **THEN** 底部中央显示向下箭头或 "向下滚动" 文字
- **AND** 有轻微的上下浮动动画
