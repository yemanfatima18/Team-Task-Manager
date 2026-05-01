import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../components/AuthContext'

const PRI = { high:'tag-red', medium:'tag-warn', low:'tag-green' }

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')

  useEffect(() => { api.getDashboard().then(setData).catch(e=>setErr(e.message)) }, [])

  if (err)   return <div className="alert alert-err">{err}</div>
  if (!data) return <div className="spinner">Loading dashboard…</div>

  const { stats, overdueList, projectProgress } = data

  const STATS = [
    { icon:'📋', num: stats.total,   label:'Total Tasks',  color:'#2563eb' },
    { icon:'✅', num: stats.done,    label:'Completed',    color:'#16a34a' },
    { icon:'⚡', num: stats.inprog,  label:'In Progress',  color:'#d97706' },
    { icon:'⏰', num: stats.overdue, label:'Overdue',      color:'#dc2626' },
    { icon:'📁', num: stats.projects,label:'Projects',     color:'#7c3aed' },
    { icon:'👥', num: stats.members, label:'Team Members', color:'#0891b2' },
  ]

  return (
    <div style={{animation:'slideUp .3s ease'}}>
      <div className="page-header">
        <div>
          <div className="page-title">Good {getGreeting()}, {user.name.split(' ')[0]} 👋</div>
          <div className="page-sub">Here's what's happening in your workspace today</div>
        </div>
      </div>

      <div className="stats-grid">
        {STATS.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-num" style={{color: s.color}}>{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="two-card-grid">
        <div className="card">
          <div className="card-title">⏰ Overdue Tasks</div>
          {overdueList.length === 0
            ? <div className="empty-state"><div className="emoji">🎉</div><p>No overdue tasks!</p><small>You're all caught up</small></div>
            : overdueList.map(t => (
                <div className="mini-task" key={t.id}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:'#dc2626',flexShrink:0}}/>
                  <div className="mini-task-body">
                    <div className="mini-task-title">{t.title}</div>
                    <div className="mini-task-sub">Due {t.due_date} · {t.project_name||'No project'}</div>
                  </div>
                  <span className={`tag ${PRI[t.priority]}`}>{t.priority}</span>
                </div>
              ))
          }
        </div>

        <div className="card">
          <div className="card-title">📊 Project Progress</div>
          {projectProgress.length === 0
            ? <div className="empty-state"><div className="emoji">📁</div><p>No projects yet</p></div>
            : projectProgress.map(p => {
                const pct = p.task_count ? Math.round(p.done_count / p.task_count * 100) : 0
                return (
                  <div key={p.id} style={{marginBottom:18}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                      <span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{p.name}</span>
                      <span style={{fontSize:12,fontWeight:700,color:'var(--primary)'}}>{pct}%</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}}/></div>
                    <div style={{fontSize:11,color:'var(--text3)'}}>{p.done_count||0} of {p.task_count||0} tasks done</div>
                  </div>
                )
              })
          }
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
