'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'

export default function CoAdminsPage() {
  const [coAdmins, setCoAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    loadCoAdmins()
  }, [])

  async function loadCoAdmins() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/co-admins')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCoAdmins(data.coAdmins)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteCoAdmin(id) {
    if (!confirm('Are you sure? This will remove all their access.')) return

    try {
      setDeleting(id)
      const res = await fetch(`/api/admin/co-admins/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCoAdmins(coAdmins.filter((c) => c._id !== id))
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <div className="p-6 text-center">Loading co-admins...</div>

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-textPrimary">
            Co-Admins
          </h1>
          <p className="mt-1 text-sm text-brand-textSecondary">
            Manage co-admins and assign them to categories
          </p>
        </div>
        <Link
          href="/admin/co-admins/new"
          className="flex items-center gap-2 rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Co-Admin
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {coAdmins.length === 0 ? (
        <div className="rounded-lg border border-brand-border bg-brand-surface p-8 text-center">
          <p className="text-brand-textSecondary">No co-admins yet</p>
          <Link href="/admin/co-admins/new" className="mt-3 inline-block text-brand-accent hover:underline">
            Create the first co-admin
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-brand-border bg-white shadow-card">
          <table className="w-full">
            <thead className="border-b border-brand-border bg-brand-surface">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brand-textSecondary">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brand-textSecondary">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brand-textSecondary">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brand-textSecondary">
                  Permissions
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brand-textSecondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {coAdmins.map((admin) => (
                <tr key={admin._id} className="hover:bg-brand-surface/50">
                  <td className="px-4 py-3 text-sm font-medium text-brand-textPrimary">
                    {admin.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-textSecondary">{admin.email}</td>
                  <td className="px-4 py-3 text-sm font-mono text-brand-textSecondary">
                    {admin.username}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-1.5">
                      {admin.permissions.map((perm) => (
                        <span key={perm} className="rounded-full bg-brand-accent/15 px-2.5 py-1 text-xs font-medium text-brand-accent capitalize">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/co-admins/${admin._id}/edit`}
                        className="p-2 text-brand-accent hover:bg-brand-surface rounded"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteCoAdmin(admin._id)}
                        disabled={deleting === admin._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
