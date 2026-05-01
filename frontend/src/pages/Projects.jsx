import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../components/AuthContext'

const ST = { active:'tag-blue', 'on-hold':'tag-warn', completed:'tag-green' }

export default function Projects() {
  const { user }   = useAuth()
  const isAdmin    = user.role === 'Admin'
  const [projects, setProjects] = useState([])
  const [modal,    setModal]    = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState({ name:'', description:'', status:'active' })
  const [err,      setErr]      = useState('')
  const [busy,     setBusy]     = useState(false)

  const load = () => api.getProjects().then(setProjects)
  useEffect(()=>{ load() },[])

  const openNew  = () => { setEditing(null); setForm({name:'',description:'',status:'active'}); setErr(''); setModal(true) }
  const openEdit = p   => { setEditing(p);   setForm({name:p.name,description:p.description||'',status:p.status}); setErr(''); setModal(true) }

  const save = async () => {
    if (!form.name.trim()) return setErr('Project name is required')
    setErr(''); setBusy(true)
    try {
      editing ? await api.updateProject(editing.id, form) : await api.createProject(form)
      setModal(false); load()
    } catch(e) { setErr(e.message) }
    finally { setBusy(false) }
  }

  const del = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return
    await api.deleteProject(id); load()
  }

  return (
    <div style={{animation:'slideUp .3s ease'}}>
      <div className="page-header">
        <div><div className="page-title">Projects</div><div className="page-sub">Manage and track all your team projects</div></div>
        <div className="page-actions">
          {isAdmin && <button className="btn btn-primary" onClick={openNew}>+ New Project</button>}
        </div>
      </div>

      {projects.length === 0
        ? <div className="empty-state"><div className="emoji">📁</div><p>No projects yet</p><small>Create your first project to get started</small></div>
        : <div className="project-grid">
            {projects.map(p => {
              const pct = p.task_count ? Math.round(p.done_count / p.task_count * 100) : 0
              return (
                <div className="project-card" key={p.id}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                    <h3>{p.name}</h3>
                    {isAdmin && (
                      <div style={{display:'flex',gap:6,flexShrink:0}}>
                        <button className="btn btn-white btn-sm" onClick={()=>openEdit(p)}>✏️ Edit</button>
                        <button className="btn btn-sm" style={{background:'var(--danger-l)',color:'var(--danger)',border:'1px solid #fecaca'}} onClick={()=>del(p.id)}>🗑</button>
                      </div>
                    )}
                  </div>
                  <p>{p.description || 'No description'}</p>
                  <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}}/></div>
                  <div className="project-footer">
                    <span style={{fontSize:11,color:'var(--text3)',fontWeight:500}}>{p.done_count||0}/{p.task_count||0} tasks · {pct}%</span>
                    <span className={`tag ${ST[p.status]}`}>{p.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
      }

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="modal-title">{editing ? '✏️ Edit Project' : '📁 New Project'}</div>
            {err && <div className="alert alert-err">⚠ {err}</div>}
            <div className="field"><label>Project Name *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Website Redesign"/></div>
            <div className="field"><label>Description</label><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Brief description of this project"/></div>
            <div className="field"><label>Status</label>
              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                <option value="active">🟢 Active</option>
                <option value="on-hold">🟡 On Hold</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-white" onClick={()=>setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={busy}>{busy?'Saving…':'Save Project'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
