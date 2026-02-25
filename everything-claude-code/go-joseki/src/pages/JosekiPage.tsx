import { useJosekiStore } from '../store/josekiStore';
import { JosekiFilterPanel } from '../components/joseki/JosekiFilter';
import { JosekiList } from '../components/joseki/JosekiList';
import { JosekiViewer } from '../components/joseki/JosekiViewer';

export function JosekiPage() {
  const { selectedJoseki } = useJosekiStore();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {selectedJoseki ? (
        <JosekiViewer />
      ) : (
        <>
          <JosekiFilterPanel />
          <JosekiList />
        </>
      )}
    </div>
  );
}
