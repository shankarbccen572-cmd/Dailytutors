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

// GET: List all co-admins (super-admin only)
export async function GET(req) {
  const user = await getCurrentUser()
  const err = await checkSuperAdmin(user)
  if (err) return NextResponse.json({ error: err.error }, { status: err.status })

  await dbConnect()
  const coAdmins = await User.find({ role: 'co-admin', createdBy: user._id })
    .select('-password')
    .sort({ createdAt: -1 })

  return NextResponse.json({ coAdmins })
}

// POST: Create new co-admin (super-admin only)
export async function POST(req) {
  const user = await getCurrentUser()
  const err = await checkSuperAdmin(user)
  if (err) return NextResponse.json({ error: err.error }, { status: err.status })

  const { name, email, username, password, managedCategories } = await req.json()

  // Validation
  if (!name || !email || !username || !password) {
    return NextResponse.json(
      { error: 'Name, email, username, and password are required' },
      { status: 400 }
    )
  }

  if (!Array.isArray(managedCategories) || managedCategories.length === 0) {
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

  // Check if email or username already exists
  const existing = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase() }],
  })
  if (existing) {
    return NextResponse.json(
      { error: 'Email or username already in use' },
      { status: 400 }
    )
  }

  try {
    // Hash password
    const hashedPassword = await hashPassword(password)

    const coAdmin = new User({
      name,
      email,
      username: username.toLowerCase(),
      password: hashedPassword,
      role: 'co-admin',
      permissions: managedCategories,
      createdBy: user._id,
    })

    await coAdmin.save()

    return NextResponse.json(
      {
        ok: true,
        coAdmin: {
          _id: coAdmin._id.toString(),
          name: coAdmin.name,
          email: coAdmin.email,
          username: coAdmin.username,
          permissions: coAdmin.permissions,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Error creating co-admin:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
