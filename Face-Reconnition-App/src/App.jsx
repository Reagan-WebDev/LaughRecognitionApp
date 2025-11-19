import React, { useState, useEffect } from 'react'
import Signup from './components/SignUp'
import Main from './components/Main'
import './styles/app.css'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('laugh_detector_current')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const handleLogin = (userObj) => {
    localStorage.setItem('laugh_detector_current', JSON.stringify(userObj))
    setUser(userObj)
  }

  const handleLogout = () => {
    localStorage.removeItem('laugh_detector_current')
    setUser(null)
  }

  return (
    <div className="app-root">
      {!user ? (
        <Signup onLogin={handleLogin} />
      ) : (
        <Main user={user} onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
