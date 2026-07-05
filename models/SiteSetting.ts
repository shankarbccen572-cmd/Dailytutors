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

const SiteSettingSchema = new mongoose.Schema(
  {
    navbarLinks: { type: [NavbarLinkSchema], default: [] },
    heroBanners: { type: [HeroBannerSchema], default: [] },
    heroStats: { type: [StatItemSchema], default: [] },
    featureLabels: { type: [String], default: [] },
    footerText: { type: String, default: '© 2026 Daily Tutors. All rights reserved.' },
  },
  { timestamps: true }
)

export default (
  mongoose.models.SiteSetting ||
  mongoose.model('SiteSetting', SiteSettingSchema)
) as mongoose.Model<any>
