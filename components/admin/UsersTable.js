'use client'

import { useState } from 'react'

const ROLES = ['student', 'faculty', 'admin']

const ROLE_STYLES = {
  student: 'bg-brand-border/60 text-brand-textSecondary',
  faculty: 'bg-brand-accentLight text-brand-accentDark',
  admin: 'bg-brand-success/15 text-brand-success',
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function UsersTable({ initialUsers, currentUserId }) {
  const [users, setUsers] = useState(initialUsers)
  const [busyId, setBusyId] = useState(null)

  async function changeRole(id, role) {
    setBusyId(id)
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    setBusyId(null)
    if (res.ok) {
      setUsers((p) => p.map((u) => (u._id === id ? { ...u, role } : u)))
    } else {
      alert('Could not update role')
    }
  }

  async function remove(id, name) {
    if (!confirm(`Delete ${name || 'this user'} and their enrollments?`)) return
    setBusyId(id)
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    setBusyId(null)
    if (res.ok) {
      setUsers((p) => p.filter((u) => u._id !== id))
    } else {
      const { error } = await res.json().catch(() => ({}))
      alert(error || 'Could not delete user')
    }
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-brand-border bg-brand-primary p-12 text-center text-brand-textSecondary">
        No users yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-primary">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-brand-border text-brand-textSecondary">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email / Login ID</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Enrollments</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u._id === currentUserId
            return (
              <tr key={u._id} className="border-b border-brand-border last:border-0">
                <td className="px-4 py-3 font-medium text-brand-textPrimary">
                  {u.name || '—'}
                  {isSelf && (
                    <span className="ml-2 text-xs font-normal text-brand-textSecondary">
                      (you)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-brand-textSecondary">
                  {u.username || u.email}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`mr-2 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      ROLE_STYLES[u.role] || ROLE_STYLES.student
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-brand-textSecondary">{u.enrollments}</td>
                <td className="px-4 py-3 text-brand-textSecondary">
                  {formatDate(u.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <select
                      value={u.role}
                      disabled={busyId === u._id || isSelf}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                      className="rounded-md border border-brand-border px-2 py-1.5 text-sm outline-none focus:border-brand-accent disabled:opacity-50"
                      title={isSelf ? "You can't change your own role" : 'Change role'}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => remove(u._id, u.name)}
                      disabled={busyId === u._id || isSelf}
                      className="rounded-md border border-brand-border px-3 py-1.5 text-sm font-medium text-brand-accent hover:bg-brand-accentLight disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
