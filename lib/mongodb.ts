import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined
}

// Cache the connection across hot reloads in dev and across lambda
// invocations in production so we don't open a new connection per request.
let cached = global._mongoose
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null }
}

export default async function dbConnect(): Promise<typeof mongoose> {
  if (cached!.conn) return cached!.conn

  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable')
  }

  if (!cached!.promise) {
    cached!.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        // Keep a warm pool of connections so requests don't pay reconnect cost.
        maxPoolSize: 10,
        minPoolSize: 2,
        // Fail fast instead of hanging when Atlas is briefly unreachable.
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
      })
      .then((m) => m)
  }

  cached!.conn = await cached!.promise
  return cached!.conn
}
