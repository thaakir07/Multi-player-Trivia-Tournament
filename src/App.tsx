import LoginPage from './Pages/Login';
import ProfilePage from './Pages/Profile';
import AdminPage from './Pages/AdminPage';
import CreateLobby from './Pages/CreateLobby';
import MatchPage from './Pages/MatchPage';
import WaitingLobby from './Pages/WaitingLobby';
import Results from './Pages/Results';
import NavBar from './Components/NavBar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import useLocalStorage from './Backend/UseLocalStorage';
import './App.css'
import { SocketProvider } from './Context/SocketContext';
import React from 'react';
import SwaggerUI from './Components/Doc/apiDoc';
import ReactDOM from 'react-dom';



function App() {
  const [hasAccount, setHasAccount] = useLocalStorage('hasAccount', false);
  return (
    <React.StrictMode>

   <SocketProvider> 
    <Router>
      <Routes>
        {/* Deafult landing page with a login/sign-up form*/}
        <Route
          path="/"
          element={<LoginPage hasAccount={hasAccount} setHasAccount={setHasAccount} />}
        />
        {/* User profile page */}
        <Route
          path="/profile"
          element={<ProfilePage />}
        />
        {/* Admin page ONLY FOR ADMIN USER*/}
        <Route
          path="/admin"
          element={<AdminPage/>}
        />
        {/* Page to select match details */}
        <Route
          path="/createLobby"
          element={<CreateLobby/>}
        />

        <Route
          path="/match"
          element={<MatchPage/>}
        />
        <Route
          path="/match/:matchId"
          element={<MatchPage/>}
        />
        {/* Alternative routes for game/lobby */}
        <Route
          path="/game/:matchId"
          element={<MatchPage/>}
        />
        <Route
          path="/lobby/:matchId"
          element={<MatchPage/>}
        />
        {/* Waiting Room before match starts */}
        <Route
          path="/waitingLobby"
          element={<WaitingLobby/>}
        />
        <Route
          path="/waitingLobby/:matchId"
          element={<WaitingLobby/>}
        />
        <Route
          path="/matchPage/match/"
          element={<MatchPage/>}
        />
        <Route
          path="/matchPage/match/:matchId"
          element={<MatchPage/>}
        />
        <Route
          path="/result"
          element={<Results/>}
        />
        {/* Error page */}
        <Route
          path="*"
          element={
            <div className="error-page">
              <NavBar/>
              <h1>404 Page not found</h1>
            </div>
          }
        />
        <Route
          path="/documentation"
          element={<SwaggerUI/>}
        />
      </Routes>
    </Router>
  </SocketProvider>
  </React.StrictMode>
  )
}

export default App
