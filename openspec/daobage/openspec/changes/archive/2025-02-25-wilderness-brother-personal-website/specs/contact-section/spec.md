## ADDED Requirements

### Requirement: 联系区域布局
Contact 区域 SHALL 提供联系方式和社交媒体链接，采用极简居中布局。

#### Scenario: 查看联系区域
- **WHEN** 用户滚动到页面底部
- **THEN** 显示 Contact 区域
- **AND** 内容垂直居中
- **AND** 背景使用深色（深棕或墨绿）或与 Hero 区域呼应

### Requirement: 联系方式展示
Contact 区域 SHALL 显示邮箱和社交媒体链接。

#### Scenario: 查看联系方式
- **WHEN** 用户查看 Contact 区域
- **THEN** 显示联系邮箱（如 hello@wildernessbrother.com）
- **AND** 显示社交媒体图标链接（Instagram、YouTube、微信等）
- **AND** 图标使用浅色（白色或米色）
- **AND** 图标大小为 24px-32px
- **AND** 图标之间有 16px-24px 间距

### Requirement: 结束语
Contact 区域 SHALL 包含一句结束语。

#### Scenario: 查看结束语
- **WHEN** 用户查看 Contact 区域
- **THEN** 显示一句简短的结束语（如 "期待与你相遇在荒野"）
- **AND** 文字使用优雅的中文字体
- **AND** 文字颜色为浅色

### Requirement: 版权信息
Contact 区域 SHALL 包含版权信息。

#### Scenario: 查看版权信息
- **WHEN** 用户查看 Contact 区域底部
- **THEN** 显示版权文字 "© 2025 荒野刀疤哥"
- **AND** 文字较小（12px-14px）
- **AND** 文字颜色为半透明白色或浅灰色
