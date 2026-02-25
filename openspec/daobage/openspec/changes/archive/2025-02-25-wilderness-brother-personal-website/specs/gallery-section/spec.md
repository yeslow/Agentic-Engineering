## ADDED Requirements

### Requirement: 画廊区域布局
Gallery 区域 SHALL 展示荒野生活的精选瞬间，使用网格布局。

#### Scenario: 桌面端查看
- **WHEN** 用户在桌面端查看 Gallery 区域
- **THEN** 显示 3 列图片网格
- **AND** 每行显示 3 张图片
- **AND** 图片之间有 16px-24px 间距
- **AND** 总共展示 6-9 张图片

#### Scenario: 平板端查看
- **WHEN** 用户在平板设备查看
- **THEN** 显示 2 列图片网格

#### Scenario: 移动端查看
- **WHEN** 用户在移动端查看 Gallery 区域
- **THEN** 显示单列图片堆叠
- **AND** 每张图片占据 100% 宽度

### Requirement: 图片展示
画廊图片 SHALL 统一风格，具有荒野美学。

#### Scenario: 浏览画廊
- **WHEN** 用户查看 Gallery 区域
- **THEN** 所有图片具有相似的色调处理（如暖色调、低饱和或黑白）
- **AND** 图片有统一的圆角（8px-12px）
- **AND** 图片使用 object-fit: cover 保持比例
- **AND** 图片比例为 4:3 或 1:1（正方形）

### Requirement: 懒加载
Gallery 图片 SHALL 使用懒加载优化性能。

#### Scenario: 页面初始加载
- **WHEN** 页面首次加载
- **THEN** 可视区域外的图片不加载
- **AND** 图片进入视口时开始加载

#### Scenario: 图片加载中
- **WHEN** 图片正在加载
- **THEN** 显示占位符（纯色或模糊预览）
- **AND** 加载完成后淡入显示

### Requirement: 区域标题
Gallery 区域 SHALL 有一个居中的区域标题。

#### Scenario: 查看区域标题
- **WHEN** 用户滚动到 Gallery 区域
- **THEN** 显示区域标题 "瞬间" 或 "Moments"
- **AND** 标题位于图片网格上方，居中显示
- **AND** 标题使用深色文字（与浅色背景对比）
