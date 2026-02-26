import { useJosekiStore } from '../../store/josekiStore';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

export function JosekiFilterPanel() {
  const { filter, setFilter, clearFilter, filteredList, josekiList } = useJosekiStore();

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">筛选定式</span>
          <Badge variant="secondary" className="ml-auto">
            {filteredList.length} / {josekiList.length}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <Label>类型</Label>
            <Select
              value={filter.category || 'all'}
              onValueChange={(value) => setFilter({ category: value === 'all' ? '' : value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="全部类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="corner">角部定式</SelectItem>
                <SelectItem value="side">边上定式</SelectItem>
                <SelectItem value="center">中腹定式</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>下法</Label>
            <Select
              value={filter.type || 'all'}
              onValueChange={(value) => setFilter({ type: value === 'all' ? '' : value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="全部下法" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部下法</SelectItem>
                <SelectItem value="approach">挂角</SelectItem>
                <SelectItem value="enclosure">缔角</SelectItem>
                <SelectItem value="pincer">夹攻</SelectItem>
                <SelectItem value="invasion">点角</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>难度</Label>
            <Select
              value={filter.difficulty?.toString() || '0'}
              onValueChange={(value) => setFilter({ difficulty: value === '0' ? undefined : Number(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="全部难度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">全部难度</SelectItem>
                <SelectItem value="1">★ 入门</SelectItem>
                <SelectItem value="2">★★ 基础</SelectItem>
                <SelectItem value="3">★★★ 进阶</SelectItem>
                <SelectItem value="4">★★★★ 高级</SelectItem>
                <SelectItem value="5">★★★★★ 专业</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>搜索</Label>
            <Input
              type="text"
              value={filter.searchTerm || ''}
              onChange={(e) => setFilter({ searchTerm: e.target.value })}
              placeholder="名称或标签..."
            />
          </div>

          <Button
            variant="outline"
            onClick={clearFilter}
            className="w-full"
          >
            <X className="h-4 w-4 mr-1" />
            清除
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
