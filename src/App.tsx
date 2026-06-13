import { useState } from 'react';
import type { Tab } from './types';
import { AppProvider } from './store/AppContext';
import { Header } from './components/layout/Header';
import { HatakeMap } from './components/map/HatakeMap';
import { CropList } from './components/crops/CropList';
import { LogList } from './components/logs/LogList';
import { CalendarView } from './components/calendar/CalendarView';
import { PhotoTab } from './components/photos/PhotoTab';

function AppInner() {
  const [activeTab, setActiveTab] = useState<Tab>('map');

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-4xl mx-auto">
        {activeTab === 'map' && <HatakeMap />}
        {activeTab === 'crops' && <CropList />}
        {activeTab === 'logs' && <LogList />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'photos' && <PhotoTab />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
