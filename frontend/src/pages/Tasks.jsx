import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../components/AuthContext'

const CYCLE = { todo:'in-progress', 'in-progress':'done', done:'todo' }
const PRI   = { high:'tag-red', medium:'tag-warn', low:'tag-green' }
const STTAG = { todo:'tag-gray', 'in-progress':'tag-warn', done:'tag-green' }
const isOverdue = d => d && new Date(d) < new Date()

export default function Tasks() {
  const { user }  = useAuth()
  const isAdmin   = user.role === 'Admin'
  const [tasks,    setTasks]   = useState([])
  const [team,     setTeam]    = useState([])
  const [projects, setProjects]= useState([])
  const [filter,   setFilter]  = useState('all')
  const [modal,    setModal]   = useState(false)
  const [form,     setForm]    = useState({ title:'', assignee_id:'', project_id:'', priority:'medium', due_date:'' })
  const [err,      setErr]     = useState('')
  const [busy,     setBusy]    = useState(false)

  const load = () => api.getTasks().then(setTasks)
  useEffect(() => { load(); api.getTeam().then(setTeam); api.getProjects().then(setProjects) }, [])

  const filtered = tasks.filter(t => {
    if (filter === 'all')     return true
    if (filter === 'overdue') return isOverdue(t.due_date) && t.status !== 'done'
    return t.status === filter
  })

  const toggle = async t => {
    await api.updateStatus(t.id, CYCLE[t.status] || 'todo'); load()
  }

  const del = async id => {
    if (!confirm('Delete this task?')) return
    await api.deleteTask(id); load()
  }

  const openNew = () => {
    setForm({ title:'', assignee_id:team[0]?.id||'', project_id:projects[0]?.id||'', priority:'medium', due_date:'' })
    setErr(''); setModal(true)
  }

  const save = async () => {
    if (!form.title.trim()) return setErr('Task title is required')
    setErr(''); setBusy(true)
    try {
      await api.createTask({ ...form, assignee_id: form.assignee_id||null, project_id: form.project_id||null })
      setModal(false); load()
    } catch(e) { setErr(e.message) }
    finally { setBusy(false) }
  }

  const counts = {
    all: tasks.length,
    todo: tasks.filter(t=>t.status==='todo').length,
    'in-progress': tasks.filter(t=>t.status==='in-progress').length,
    done: tasks.filter(t=>t.status==='done').length,
    overdue: tasks.filter(t=>isOverdue(t.due_date)&&t.status!=='done').length,
  }

  return (
    <div style={{animation:'slideUp .3s ease'}}>
      <div className="page-header">
        <div><div className="page-title">Tasks</div><div className="page-sub">Track and manage all tasks across projects</div></div>
        <div className="page-actions">
          {isAdmin && <button className="btn btn-primary" onClick={openNew}>+ New Task</button>}
        </div>
      </div>

      <div className="filters">
        {['all','todo','in-progress','done','overdue'].map(f => (
          <button key={f} className={`filter-btn${filter===f?' active':''}`} onClick={()=>setFilter(f)}>
            {f==='overdue'?'⚠ Overdue':f==='in-progress'?'In Progress':f.charAt(0).toUpperCase()+f.slice(1)}
            {counts[f]>0 && <span style={{marginLeft:4,background:'rgba(0,0,0,.1)',borderRadius:10,padding:'0 5px',fontSize:10}}>{counts[f]}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <div className="empty-state"><div className="emoji">✅</div><p>No tasks found</p><small>Try a different filter or create a new task</small></div>
        : <div className="task-list">
            {filtered.map(t => {
              const over = isOverdue(t.due_date) && t.status !== 'done'
              return (
                <div className="task-item" key={t.id}>
                  <div
                    className={`task-check${t.status==='done'?' done':t.status==='in-progress'?' inprog':''}`}
                    onClick={()=>toggle(t)}
                    title="Click to cycle status"
                  >
                    {t.status==='done'?'✓':t.status==='in-progress'?'●':''}
                  </div>
                  <div className="task-body">
                    <div className={`task-title${t.status==='done'?' done':''}`}>{t.title}</div>
                    <div className="task-meta">
                      <span className={`tag ${PRI[t.priority]}`}>{t.priority}</span>
                      <span className={`tag ${STTAG[t.status]}`}>{t.status}</span>
                      {t.project_name && <span className="tag tag-blue">📁 {t.project_name}</span>}
                      {t.due_date && <span className={`task-due${over?' overdue':''}`}>📅 {t.due_date}{over?' (overdue)':''}</span>}
                      {t.assignee_name && (
                        <span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:11,color:'var(--text2)',fontWeight:500}}>
                          <span style={{width:18,height:18,borderRadius:'50%',background:t.assignee_color||'#2563eb',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'#fff',fontWeight:800}}>
                            {t.assignee_name[0]}
                          </span>
                          {t.assignee_name}
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="task-actions">
                      <button className="icon-btn" onClick={()=>del(t.id)} title="Delete task">🗑</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
      }

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="modal-title">✅ New Task</div>
            {err && <div className="alert alert-err">⚠ {err}</div>}
            <div className="field"><label>Task Title *</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Setup CI/CD pipeline"/></div>
            <div className="two-col">
              <div className="field"><label>Assign To</label>
                <select value={form.assignee_id} onChange={e=>setForm({...form,assignee_id:e.target.value})}>
                  <option value="">Unassigned</option>
                  {team.map(u=><option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div className="field"><label>Project</label>
                <select value={form.project_id} onChange={e=>setForm({...form,project_id:e.target.value})}>
                  <option value="">No project</option>
                  {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="two-col">
              <div className="field"><label>Priority</label>
                <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
              <div className="field"><label>Due Date</label>
                <input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-white" onClick={()=>setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={busy}>{busy?'Adding…':'Add Task'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
