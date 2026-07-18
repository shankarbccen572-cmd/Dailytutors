import mongoose from 'mongoose'

// A course/question category (a "standard" or a competitive exam). This is the
// canonical, DB-backed taxonomy every Course must belong to. Seeded from
// lib/categories.ts via scripts/migrate-categories.mjs. Kept intentionally
// small — the seven business categories — but modelled as a collection so it
// is queryable, filterable and extensible without code changes.
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    // 'school' (8th–12th) or 'exam' (NEET, KCET) — drives grouping in the UI.
    kind: { type: String, enum: ['school', 'exam'], default: 'school', index: true },
    // Display ordering in dropdowns / tabs.
    order: { type: Number, default: 0 },
    // Soft toggle so a category can be retired without deleting course links.
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
)

export default (mongoose.models.Category ||
  mongoose.model('Category', CategorySchema)) as mongoose.Model<any>
