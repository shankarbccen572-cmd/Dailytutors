import mongoose from 'mongoose'

const NavbarLinkSchema = new mongoose.Schema(
  {
    label: { type: String, default: '' },
    href: { type: String, default: '' },
  },
  { _id: false }
)

const StatItemSchema = new mongoose.Schema(
  {
    value: { type: String, default: '' },
    label: { type: String, default: '' },
  },
  { _id: false }
)

const HeroBannerSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    bgColor: { type: String, default: '#D92F2F' },
    textColor: { type: String, default: '#FFFFFF' },
    ctaText: { type: String, default: 'Start Learning' },
    ctaHref: { type: String, default: '/login' },
    position: { type: Number, default: 0 },
  },
  { _id: false }
)

const HighlightSchema = new mongoose.Schema(
  {
    icon: { type: String, default: 'Sparkles' },
    title: { type: String, default: '' },
    sub: { type: String, default: '' },
  },
  { _id: false }
)

const ExamCategorySchema = new mongoose.Schema(
  {
    icon: { type: String, default: 'Sparkles' },
    title: { type: String, default: '' },
    tags: { type: [String], default: [] },
    href: { type: String, default: '/courses' },
  },
  { _id: false }
)

const FooterColumnSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    links: { type: [NavbarLinkSchema], default: [] },
  },
  { _id: false }
)

const SocialLinkSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'mail' },
    href: { type: String, default: '' },
  },
  { _id: false }
)

const SiteSettingSchema = new mongoose.Schema(
  {
    navbarLinks: { type: [NavbarLinkSchema], default: [] },
    heroBanners: { type: [HeroBannerSchema], default: [] },
    heroStats: { type: [StatItemSchema], default: [] },

    highlights: { type: [HighlightSchema], default: [] },

    examBadge: { type: String, default: '' },
    examHeading: { type: String, default: '' },
    examSubheading: { type: String, default: '' },
    examCategories: { type: [ExamCategorySchema], default: [] },

    whyBadge: { type: String, default: '' },
    whyHeading: { type: String, default: '' },
    whySubheading: { type: String, default: '' },
    featureLabels: { type: [String], default: [] },

    ctaHeading: { type: String, default: '' },
    ctaSubtitle: { type: String, default: '' },
    ctaPrimaryLabel: { type: String, default: '' },
    ctaSecondaryLabel: { type: String, default: '' },
    ctaSecondaryHref: { type: String, default: '/courses' },

    coursesBadge: { type: String, default: '' },
    coursesTitle: { type: String, default: '' },
    coursesSubtitle: { type: String, default: '' },

    footerAbout: { type: String, default: '' },
    footerColumns: { type: [FooterColumnSchema], default: [] },
    socialLinks: { type: [SocialLinkSchema], default: [] },
    footerText: { type: String, default: '© 2026 Daily Tutors. All rights reserved.' },
  },
  { timestamps: true }
)

export default (
  mongoose.models.SiteSetting ||
  mongoose.model('SiteSetting', SiteSettingSchema)
) as mongoose.Model<any>
