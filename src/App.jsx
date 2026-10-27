import React, { useState } from 'react';
import { FirebaseProvider } from './context/FirebaseContext';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import JournalScreen from './screens/JournalScreen';
import GoalTrackerScreen from './screens/GoalTrackerScreen';
import CommunityScreen from './screens/CommunityScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import GamesScreen from './screens/GamesScreen';
import TopNavBar from './components/TopNavBar';
import { PAGES } from './utils/constants';

function App(){
  const [currentPage, setCurrentPage] = useState(PAGES.HOME);
  const [authPage, setAuthPage] = useState(null);

  return (
    <FirebaseProvider>
      <Router>
        <div className="min-h-screen font-sans bg-sky-50">
          <TopNavBar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setAuthPage={setAuthPage}
          />

          <main className="pb-24 pt-6">
            {currentPage === PAGES.HOME && <HomeScreen setCurrentPage={setCurrentPage} />}
            {currentPage === PAGES.JOURNAL && <JournalScreen />}
            {currentPage === PAGES.GOALS && <GoalTrackerScreen />}
            {currentPage === PAGES.GAMES && <GamesScreen />}
            {currentPage === PAGES.COMMUNITY && <CommunityScreen />}
            {currentPage === PAGES.CHAT && <ChatbotScreen />}
          </main>

          {/* Auth modal */}
          {authPage === 'login' && (
            <LoginScreen
              setAuthPage={setAuthPage}
              setCurrentPage={setCurrentPage}
            />
          )}

        </div>
      </Router>
    </FirebaseProvider>
  );
}

export default App;
