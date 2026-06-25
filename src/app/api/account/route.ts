import { NextRequest, NextResponse } from 'next/server'
import { getUserById, updateUser } from '@/lib/database'
import { authenticateRequest } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/account
 * Soft-deletes user account (anonymizes data, keeps ID for reference integrity)
 */
export async function DELETE(req: NextRequest) {
  try {
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const body = await req.json()
    const { password, reason } = body

    if (!password) {
      return NextResponse.json({ error: 'Password is required to delete account' }, { status: 400 })
    }

    const user = getUserById(authResult.user.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    // Soft delete: anonymize PII, mark as deleted
    updateUser(user.id, {
      name: 'Deleted User',
      email: `deleted_${user.id}@removed.local`,
      phone: '',
      about: '',
      photos: [],
      city: '',
      state: '',
      occupation: '',
      income: '',
      hobbies: [],
      verified: false,
      premium: false,
      online: false,
      profileComplete: false,
    } as any)

    return NextResponse.json({
      success: true,
      message: 'Your account has been deleted. All personal data has been removed.',
    })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}

/**
 * POST /api/account/change-password
 * Change user password
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const body = await req.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }

    const user = getUserById(authResult.user.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    updateUser(user.id, { password: hashedPassword } as any)

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
