import { useJosekiStore } from '../../store/josekiStore';

export function JosekiFilterPanel() {
  const { filter, setFilter, clearFilter, filteredList, josekiList } = useJosekiStore();

  const categories = [
    { value: '', label: '全部类型' },
    { value: 'corner', label: '角部定式' },
    { value: 'side', label: '边上定式' },
    { value: 'center', label: '中腹定式' },
  ];

  const types = [
    { value: '', label: '全部下法' },
    { value: 'approach', label: '挂角' },
    { value: 'enclosure', label: '缔角' },
    { value: 'pincer', label: '夹攻' },
    { value: 'invasion', label: '点角' },
    { value: 'other', label: '其他' },
  ];

  const difficulties = [
    { value: 0, label: '全部难度' },
    { value: 1, label: '★ 入门' },
    { value: 2, label: '★★ 基础' },
    { value: 3, label: '★★★ 进阶' },
    { value: 4, label: '★★★★ 高级' },
    { value: 5, label: '★★★★★ 专业' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-ogs-border p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-ogs-text mb-1">类型</label>
          <select
            value={filter.category || ''}
            onChange={(e) => setFilter({ category: e.target.value as any })}
            className="w-full px-3 py-2 border border-ogs-border rounded focus:outline-none focus:ring-2 focus:ring-ogs-accent"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-ogs-text mb-1">下法</label>
          <select
            value={filter.type || ''}
            onChange={(e) => setFilter({ type: e.target.value as any })}
            className="w-full px-3 py-2 border border-ogs-border rounded focus:outline-none focus:ring-2 focus:ring-ogs-accent"
          >
            {types.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-ogs-text mb-1">难度</label>
          <select
            value={filter.difficulty || 0}
            onChange={(e) => setFilter({ difficulty: Number(e.target.value) || undefined })}
            className="w-full px-3 py-2 border border-ogs-border rounded focus:outline-none focus:ring-2 focus:ring-ogs-accent"
          >
            {difficulties.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-ogs-text mb-1">搜索</label>
          <input
            type="text"
            value={filter.searchTerm || ''}
            onChange={(e) => setFilter({ searchTerm: e.target.value })}
            placeholder="输入名称或标签..."
            className="w-full px-3 py-2 border border-ogs-border rounded focus:outline-none focus:ring-2 focus:ring-ogs-accent"
          />
        </div>

        <button
          onClick={clearFilter}
          className="px-4 py-2 bg-gray-100 text-ogs-text rounded hover:bg-gray-200 transition-colors"
        >
          清除
        </button>
      </div>

      <div className="mt-4 text-sm text-ogs-muted">
        显示 {filteredList.length} / {josekiList.length} 个定式
      </div>
    </div>
  );
}
