## ADDED Requirements

### Requirement: 关于区域布局
About 区域 SHALL 展示荒野刀疤哥的背景故事，采用两栏布局（图片 + 文字）。

#### Scenario: 桌面端查看
- **WHEN** 用户在桌面端查看 About 区域
- **THEN** 左侧显示人物照片（占 40% 宽度）
- **AND** 右侧显示文字介绍（占 60% 宽度）
- **AND** 整体区域有充足的上下内边距（80px-120px）

#### Scenario: 移动端查看
- **WHEN** 用户在移动端查看 About 区域
- **THEN** 图片和文字垂直堆叠
- **AND** 图片在上，文字在下
- **AND** 每栏占据 100% 宽度

### Requirement: 内容展示
About 区域 SHALL 包含标题、引言段落和详细描述。

#### Scenario: 阅读关于内容
- **WHEN** 用户查看 About 区域
- **THEN** 显示区域标题 "关于我" 或 "About"
- **AND** 显示一段引言（大号字体，概括性描述）
- **AND** 显示 2-3 段详细介绍文字
- **AND** 文字颜色为深棕色或墨绿色
- **AND** 背景为米白色或浅米色

### Requirement: 图片处理
人物照片 SHALL 有统一的视觉处理风格。

#### Scenario: 查看人物照片
- **WHEN** 用户查看 About 区域的照片
- **AND** 照片为黑白或 sepia 色调
- **AND** 或照片有轻微暗角效果
- **AND** 照片圆角或保持直角（与设计风格一致）
