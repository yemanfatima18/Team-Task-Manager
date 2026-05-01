import { useState } from 'react'
import { useAuth } from '../components/AuthContext'
import { useNavigate } from 'react-router-dom'

function Field({ label, type = 'text', value, onChange, placeholder, hint }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  )
}

export default function AuthPage() {
  const [tab,  setTab]  = useState('login')
  const [err,  setErr]  = useState('')
  const [busy, setBusy] = useState(false)
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const [lEmail, setLE] = useState('')
  const [lPass,  setLP] = useState('')
  const [sName,  setSN]  = useState('')
  const [sEmail, setSE]  = useState('')
  const [sPass,  setSP]  = useState('')
  const [sPass2, setSP2] = useState('')
  const [sRole,  setSR]  = useState('Member')

  const run = fn => async () => {
    setErr(''); setBusy(true)
    try { await fn(); navigate('/') }
    catch (e) { setErr(e.message) }
    finally { setBusy(false) }
  }

  const doLogin = run(async () => {
    if (!lEmail.trim()) throw new Error('Email is required')
    if (!lPass)         throw new Error('Password is required')
    await login(lEmail.trim(), lPass)
  })

  const doSignup = run(async () => {
    if (!sName.trim())  throw new Error('Full name is required')
    if (!sEmail.trim()) throw new Error('Email is required')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sEmail)) throw new Error('Enter a valid email address')
    if (!sPass)         throw new Error('Password is required')
    if (sPass.length < 6) throw new Error('Password must be at least 6 characters')
    if (sPass !== sPass2) throw new Error('Passwords do not match')
    await signup(sName.trim(), sEmail.trim(), sPass, sRole)
  })

  const switchTab = t => { setTab(t); setErr('') }

  const cardStyle = {
    background: '#fff',
    borderRadius: 18,
    padding: '40px 44px',
    width: '100%',
    maxWidth: 460,
    boxShadow: '0 8px 40px rgba(37,99,235,.10), 0 2px 8px rgba(0,0,0,.06)',
    border: '1px solid #e2e8f0',
    animation: 'slideUp .3s ease',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #fff1fe 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={cardStyle}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 4 }}>⬡</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#2563eb', letterSpacing: '-1px' }}>Ethara</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, fontWeight: 400 }}>Team Task Manager</div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: '#f1f5f9',
          borderRadius: 10, padding: 4, marginBottom: 26,
        }}>
          {[['login','Sign In'],['signup','Register']].map(([t, label]) => (
            <button key={t} onClick={() => switchTab(t)} style={{
              flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              fontFamily: 'Inter,sans-serif', transition: '.2s',
              background: tab === t ? '#fff' : 'none',
              color: tab === t ? '#2563eb' : '#94a3b8',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
            }}>{label}</button>
          ))}
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
            {tab === 'login' ? 'Welcome back 👋' : 'Create your account'}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>
            {tab === 'login' ? 'Sign in to your Ethara workspace' : 'Join your team workspace today'}
          </div>
        </div>

        {/* Error */}
        {err && (
          <div style={{
            padding: '11px 14px', background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 8, color: '#dc2626', fontSize: 13, fontWeight: 500,
            marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <span>⚠</span><span>{err}</span>
          </div>
        )}

        {tab === 'login' ? (
          <>
            <Field label="Email Address" type="email" value={lEmail} onChange={setLE} placeholder="you@example.com" />
            <Field label="Password" type="password" value={lPass} onChange={setLP} placeholder="Enter your password" />
            <button onClick={doLogin} disabled={busy} style={{
              width: '100%', padding: '12px', background: busy ? '#93c5fd' : '#2563eb',
              color: '#fff', borderRadius: 9, fontSize: 14, fontWeight: 700,
              border: 'none', cursor: busy ? 'not-allowed' : 'pointer', transition: '.2s',
              fontFamily: 'Inter,sans-serif', boxShadow: '0 2px 8px rgba(37,99,235,.25)',
            }}>
              {busy ? 'Signing in…' : 'Sign In →'}
            </button>

            <div style={{
              marginTop: 20, padding: '14px 16px', background: '#f8faff',
              borderRadius: 10, border: '1px solid #dbeafe',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>
                Demo Accounts
              </div>
              {[
                ['🔑 Admin',  'admin@ethara.com',  'admin123'],
                ['👤 Member', 'member@ethara.com', 'member123'],
              ].map(([role, email, pass]) => (
                <div key={role} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 0', borderBottom: '1px solid #e2e8f0', fontSize: 12,
                }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#475569' }}>{role}</span>
                    <span style={{ color: '#94a3b8', marginLeft: 8 }}>{email}</span>
                  </div>
                  <button onClick={() => { setLE(email); setLP(pass); setErr('') }} style={{
                    fontSize: 11, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe',
                    borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontWeight: 700,
                    fontFamily: 'Inter,sans-serif',
                  }}>Use →</button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <Field label="Full Name" value={sName} onChange={setSN} placeholder="Jane Doe" />
            <Field label="Email Address" type="email" value={sEmail} onChange={setSE} placeholder="you@example.com" />
            <div className="two-col">
              <Field label="Password" type="password" value={sPass} onChange={setSP} placeholder="Min 6 characters" hint="At least 6 characters" />
              <Field label="Confirm Password" type="password" value={sPass2} onChange={setSP2} placeholder="Repeat password" />
            </div>
            <div className="field">
              <label>Role</label>
              <select value={sRole} onChange={e => setSR(e.target.value)}>
                <option value="Member">👤 Member — View & update own tasks</option>
                <option value="Admin">🔑 Admin — Full access to everything</option>
              </select>
            </div>
            <button onClick={doSignup} disabled={busy} style={{
              width: '100%', padding: '12px', background: busy ? '#93c5fd' : '#2563eb',
              color: '#fff', borderRadius: 9, fontSize: 14, fontWeight: 700,
              border: 'none', cursor: busy ? 'not-allowed' : 'pointer', transition: '.2s',
              fontFamily: 'Inter,sans-serif', boxShadow: '0 2px 8px rgba(37,99,235,.25)',
            }}>
              {busy ? 'Creating account…' : 'Create Account →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
