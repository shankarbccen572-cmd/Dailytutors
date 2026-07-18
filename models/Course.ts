import mongoose from 'mongoose'

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    previewVideo: { type: String, default: '' },
    // Canonical category reference (mandatory for new courses; enforced at the
    // API layer, not the schema, so legacy rows without one still load).
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    // Denormalized category name — kept in sync with categoryId on save so
    // listings and ISR pages can render/filter without a populate/join, and so
    // legacy free-text values remain readable during migration.
    category: { type: String, default: '' },
    examTarget: { type: String, default: '' },
    language: { type: String, default: 'English' },
    originalPrice: { type: Number, default: 0 },
    discountPrice: { type: Number, default: 0 },
    instructorName: { type: String, default: '' },
    instructorBio: { type: String, default: '' },
    whatYouLearn: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    // Independent publish switches for the two content areas. Curriculum
    // defaults to visible (legacy behaviour); important questions stay hidden
    // until the admin publishes them.
    curriculumPublished: { type: Boolean, default: true },
    importantQuestionsPublished: { type: Boolean, default: false },
    // Badge customization
    badgeLabel: { type: String, default: 'Online' },
    badgeColor: { type: String, default: '#FF3131' }, // hex color
    // Premium feature badge customization
    premiumBadgeLabel: { type: String, default: 'Pro' },
    premiumBadgeColor: { type: String, default: '#F59E0B' }, // amber for pro badge
    premiumFeatureText: { type: String, default: 'Premium Features Included' },
    // Card & button customization
    cardBorderColor: { type: String, default: '#EAEAEA' }, // brand-border
    exploreButtonColor: { type: String, default: '#FF3131' }, // text/border color
    buyNowButtonColor: { type: String, default: '#FF3131' }, // background color
    // Course expiration
    expirationDays: { type: Number, default: 365 }, // days course is valid after purchase
  },
  { timestamps: true }
)

export default (mongoose.models.Course ||
  mongoose.model('Course', CourseSchema)) as mongoose.Model<any>
