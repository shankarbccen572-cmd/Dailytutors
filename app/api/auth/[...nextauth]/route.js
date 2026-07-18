import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

function getOriginFromRequest(request) {
	try {
		const forwardedProto = request.headers.get('x-forwarded-proto')
		const host = request.headers.get('host')
		if (forwardedProto && host) return `${forwardedProto}://${host}`
		// Fallback to request URL origin
		const url = new URL(request.url)
		return url.origin
	} catch (e) {
		return process.env.NEXTAUTH_URL || ''
	}
}

export async function GET(request) {
	const origin = getOriginFromRequest(request)
	if (origin) process.env.NEXTAUTH_URL = origin
	const handler = NextAuth(authOptions)
	return handler(request)
}

export async function POST(request) {
	const origin = getOriginFromRequest(request)
	if (origin) process.env.NEXTAUTH_URL = origin
	const handler = NextAuth(authOptions)
	return handler(request)
}
