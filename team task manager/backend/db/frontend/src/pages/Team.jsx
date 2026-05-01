import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../components/AuthContext'

export default function Team() {
  const { user }  = useAuth()
  const isAdmin   = user.role === 'Admin'
  const [members, setMembers] = useState([])
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState({ name:'', email:'', password:'', password2:'', role:'Member' })
  const [err,     setErr]     = useState('')
  const [busy,    setBusy]    = useState(false)

  const load = () => api.getTeam().then(setMembers)
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name.trim())  return setErr('Full name is required')
    if (!form.email.trim()) return setErr('Email is required')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setErr('Enter a valid email address')
    if (!form.password)     return setErr('Password is required')
    if (form.password.length < 6) return setErr('Password must be at least 6 characters')
    if (form.password !== form.password2) return setErr('Passwords do not match')
    setErr(''); setBusy(true)
    try { await api.addMember({ name:form.name, email:form.email, password:form.password, role:form.role }); setModal(false); load() }
    catch(e) { setErr(e.message) }
    finally { setBusy(false) }
  }

  const remove = async id => {
    if (!confirm('Remove this member from the workspace?')) return
    await api.removeMember(id); load()
  }

  return (
    <div style={{animation:'slideUp .3s ease'}}>
      <div className="page-header">
        <div><div className="page-title">Team</div><div className="page-sub">Manage workspace members and their roles</div></div>
        <div className="page-actions">
          {isAdmin && <button className="btn btn-primary" onClick={()=>{setForm({name:'',email:'',password:'',password2:'',role:'Member'});setErr('');setModal(true)}}>+ Add Member</button>}
        </div>
      </div>

      <div className="team-grid">
        {members.map(m => (
          <div className="member-card" key={m.id}>
            <div className="member-avatar" style={{background: m.color||'#2563eb'}}>{m.name[0].toUpperCase()}</div>
            <h4>{m.name}</h4>
            <div className="member-email">{m.email}</div>
            <span className={`tag ${m.role==='Admin'?'tag-purple':'tag-blue'}`}>{m.role}</span>
            <div style={{margin:'12px 0 0',padding:'10px 0 0',borderTop:'1px solid var(--border)',fontSize:12,color:'var(--text3)'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span>Tasks done</span>
                <span style={{fontWeight:700,color:'var(--text)'}}>{m.done_count||0}/{m.task_count||0}</span>
              </div>
              {m.task_count > 0 && (
                <div style={{marginTop:6}}>
                  <div className="progress-bar" style={{height:4}}>
                    <div className="progress-fill" style={{width:`${Math.round((m.done_count||0)/m.task_count*100)}%`}}/>
                  </div>
                </div>
              )}
            </div>
            {isAdmin && m.id !== user.id && (
              <button className="btn btn-sm" style={{width:'100%',marginTop:12,background:'var(--danger-l)',color:'var(--danger)',border:'1px solid #fecaca',borderRadius:7}} onClick={()=>remove(m.id)}>
                Remove Member
              </button>
            )}
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="modal-title">👥 Add Team Member</div>
            {err && <div className="alert alert-err">⚠ {err}</div>}
            <div className="field"><label>Full Name *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Jane Doe"/></div>
            <div className="field"><label>Email Address *</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="jane@example.com"/></div>
            <div className="two-col">
              <div className="field"><label>Password *</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Min 6 characters"/></div>
              <div className="field"><label>Confirm Password *</label><input type="password" value={form.password2} onChange={e=>setForm({...form,password2:e.target.value})} placeholder="Repeat password"/></div>
            </div>
            <div className="field"><label>Role</label>
              <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                <option value="Member">👤 Member</option>
                <option value="Admin">🔑 Admin</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-white" onClick={()=>setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={busy}>{busy?'Adding…':'Add Member'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
