import React, { useState } from 'react'
import '../styles/auth.css'

function Signup({ onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || password.length < 4) {
      setError('Please enter a valid name, email and password (min 4 chars).')
      return
    }

    const usersRaw = localStorage.getItem('laugh_detector_users')
    const users = usersRaw ? JSON.parse(usersRaw) : []

    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (exists) {
      setError('An account with that email already exists. Please login or use another email.')
      return
    }

    const newUser = { id: Date.now(), name: name.trim(), email: email.trim(), password }
    users.push(newUser)
    localStorage.setItem('laugh_detector_users', JSON.stringify(users))

    // auto-login
    onLogin(newUser)
  }

  const handleDemo = () => {
    const demo = { id: 'demo', name: 'Reagan', email: 'demo@example.com' }
    onLogin(demo)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="title">Laugh Detector</h1>
        <p className="subtitle">Sign up to try the face‑laugh detector</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Reagan Otieno" />
          </label>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min 4 chars" />
          </label>

          {error && <div className="error">{error}</div>}

          <div className="actions">
            <button type="submit" className="btn">Create account</button>
            <button type="button" className="btn btn-ghost" onClick={handleDemo}>Try demo</button>
          </div>

          <p className="note">Your data is stored locally in this demo (no server). To reset go to browser storage.</p>
        </form>
      </div>
    </div>
  )
}

export default Signup
