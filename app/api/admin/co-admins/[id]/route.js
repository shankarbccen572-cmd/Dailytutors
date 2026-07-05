import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/session'
import { hashPassword } from '@/lib/password'

// Only super-admin can manage co-admins
async function checkSuperAdmin(user) {
  if (!user) {
    return { error: 'Sign in first', status: 401 }
  }
  if (user.role !== 'admin') {
    return { error: 'Only super-admin can manage co-admins', status: 403 }
  }
  return null
}

// PUT: Update co-admin (super-admin only)
export async function PUT(req, { params }) {
  const user = await getCurrentUser()
  const err = await checkSuperAdmin(user)
  if (err) return NextResponse.json({ error: err.error }, { status: err.status })

  const { id } = await params
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid co-admin ID' }, { status: 400 })
  }

  const { name, email, password, managedCategories } = await req.json()

  if (!managedCategories || !Array.isArray(managedCategories) || managedCategories.length === 0) {
    return NextResponse.json(
      { error: 'Co-admin must be assigned to at least one section' },
      { status: 400 }
    )
  }

  // Validate section permissions
  const validSections = ['overview', 'courses', 'enrollments', 'users']
  const invalidSections = managedCategories.filter((s) => !validSections.includes(s))
  if (invalidSections.length > 0) {
    return NextResponse.json(
      { error: `Invalid sections: ${invalidSections.join(', ')}` },
      { status: 400 }
    )
  }

  await dbConnect()

  const coAdmin = await User.findById(id)
  if (!coAdmin || coAdmin.role !== 'co-admin' || coAdmin.createdBy.toString() !== user._id.toString()) {
    return NextResponse.json({ error: 'Co-admin not found' }, { status: 404 })
  }

  // Check if new email is taken (by someone else)
  if (email && email !== coAdmin.email) {
    const emailExists = await User.findOne({ email })
    if (emailExists) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }
    coAdmin.email = email
  }

  if (name) coAdmin.name = name
  if (password) {
    coAdmin.password = await hashPassword(password)
  }
  coAdmin.permissions = managedCategories

  await coAdmin.save()

  return NextResponse.json({
    ok: true,
    coAdmin: {
      _id: coAdmin._id.toString(),
      name: coAdmin.name,
      email: coAdmin.email,
      username: coAdmin.username,
      permissions: coAdmin.permissions,
    },
  })
}

// DELETE: Delete co-admin (super-admin only)
export async function DELETE(req, { params }) {
  const user = await getCurrentUser()
  const err = await checkSuperAdmin(user)
  if (err) return NextResponse.json({ error: err.error }, { status: err.status })

  const { id } = await params
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid co-admin ID' }, { status: 400 })
  }

  await dbConnect()

  const coAdmin = await User.findById(id)
  if (!coAdmin || coAdmin.role !== 'co-admin' || coAdmin.createdBy.toString() !== user._id.toString()) {
    return NextResponse.json({ error: 'Co-admin not found' }, { status: 404 })
  }

  await User.deleteOne({ _id: id })

  return NextResponse.json({ ok: true })
}
