import React, { useState } from 'react';
import { FirebaseProvider } from './context/FirebaseContext';
import { BrowserRouter as Router } from 'react-router-dom';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import JournalScreen from './screens/JournalScreen';
import GoalTrackerScreen from './screens/GoalTrackerScreen';
import CommunityScreen from './screens/CommunityScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import GamesScreen from './screens/GamesScreen';
import BottomNavBar from './components/BottomNavBar';
import { PAGES } from './utils/constants';

function App(){
  const [currentPage, setCurrentPage] = useState(PAGES.HOME);
  const [authPage, setAuthPage] = useState('landing');

  return (
    <FirebaseProvider>
      <Router>
        <div className="min-h-screen font-sans">
          {currentPage === PAGES.HOME && <HomeScreen setCurrentPage={setCurrentPage} />}
          {currentPage === PAGES.JOURNAL && <JournalScreen />}
          {currentPage === PAGES.GOALS && <GoalTrackerScreen />}
          {currentPage === PAGES.GAMES && <GamesScreen />}
          {currentPage === PAGES.COMMUNITY && <CommunityScreen />}
          {currentPage === PAGES.CHAT && <ChatbotScreen />}

          {/* Simple auth modal flow for Login/Landing */}
          {authPage === 'landing' && <LandingScreen setAuthPage={setAuthPage} />}
          {authPage === 'login' && <LoginScreen setAuthPage={setAuthPage} setCurrentPage={setCurrentPage} />}

          <BottomNavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
      </Router>
    </FirebaseProvider>
  );
}

export default App;
