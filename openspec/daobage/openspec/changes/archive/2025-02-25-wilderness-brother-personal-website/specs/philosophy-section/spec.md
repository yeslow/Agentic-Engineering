## ADDED Requirements

### Requirement: 理念区域布局
Philosophy 区域 SHALL 展示荒野生活的核心价值观，使用三列卡片布局。

#### Scenario: 桌面端查看
- **WHEN** 用户在桌面端查看 Philosophy 区域
- **THEN** 显示 3 个等宽卡片水平排列
- **AND** 每个卡片之间有 24px-32px 间距
- **AND** 区域有深色背景（深棕或墨绿）

#### Scenario: 移动端查看
- **WHEN** 用户在移动端查看 Philosophy 区域
- **THEN** 卡片垂直堆叠
- **AND** 每个卡片占据 100% 宽度
- **AND** 卡片之间有 16px 间距

### Requirement: 理念卡片内容
每个理念卡片 SHALL 包含一个理念标题和简短描述。

#### Scenario: 查看理念卡片
- **WHEN** 用户查看 Philosophy 区域
- **THEN** 每个卡片包含：
  - 一个图标（极简线条图标）
  - 理念标题（如 "与自然共生"、"简朴生活"、"自由探索"）
  - 简短描述（2-3 句话）
- **AND** 卡片背景为半透明或带有细微纹理
- **AND** 文字颜色为浅色（白色或米色）与深色背景形成对比

### Requirement: 区域标题
Philosophy 区域 SHALL 有一个居中的区域标题。

#### Scenario: 查看区域标题
- **WHEN** 用户滚动到 Philosophy 区域
- **THEN** 显示区域标题 "我的理念" 或 "Philosophy"
- **AND** 标题位于卡片上方，居中显示
- **AND** 标题下方有一条短装饰线
- **AND** 标题使用浅色文字
