// Shared icon registry so the admin editor and the public pages agree on the
// same set of selectable icons. Icons are stored in the DB by NAME (a string);
// this maps that name to the actual lucide-react component at render time.

import {
  Video,
  ClipboardList,
  Brain,
  School,
  GraduationCap,
  Stethoscope,
  Atom,
  Landmark,
  Calculator,
  Radio,
  LineChart,
  ClipboardCheck,
  BookOpen,
  Users,
  Trophy,
  Clock,
  FileText,
  MessagesSquare,
  Sparkles,
  Target,
  Award,
  PenTool,
  Lightbulb,
  Rocket,
  Globe,
  Star,
  Zap,
  Heart,
} from 'lucide-react'

export const ICONS = {
  Video,
  ClipboardList,
  Brain,
  School,
  GraduationCap,
  Stethoscope,
  Atom,
  Landmark,
  Calculator,
  Radio,
  LineChart,
  ClipboardCheck,
  BookOpen,
  Users,
  Trophy,
  Clock,
  FileText,
  MessagesSquare,
  Sparkles,
  Target,
  Award,
  PenTool,
  Lightbulb,
  Rocket,
  Globe,
  Star,
  Zap,
  Heart,
}

// Ordered list of names for admin dropdowns.
export const ICON_NAMES = Object.keys(ICONS)

// Resolve a stored icon name to a component, falling back to a safe default.
export function getIcon(name) {
  return ICONS[name] || Sparkles
}

// On-brand pastel palettes rotated across cards so admins never pick colors.
export const CARD_PALETTES = [
  { accent: 'bg-[#FEE2E2] text-[#B91C1C]', glow: 'bg-[#FEE2E2]' },
  { accent: 'bg-[#D1FAE5] text-[#047857]', glow: 'bg-[#D1FAE5]' },
  { accent: 'bg-[#EEF2FF] text-[#4338CA]', glow: 'bg-[#EEF2FF]' },
  { accent: 'bg-[#FEF3C7] text-[#B45309]', glow: 'bg-[#FEF3C7]' },
  { accent: 'bg-[#EDE9FE] text-[#6D28D9]', glow: 'bg-[#EDE9FE]' },
  { accent: 'bg-[#DBEAFE] text-[#1D4ED8]', glow: 'bg-[#DBEAFE]' },
  { accent: 'bg-[#FCE7F3] text-[#BE123C]', glow: 'bg-[#FCE7F3]' },
  { accent: 'bg-[#ECFDF5] text-[#047857]', glow: 'bg-[#ECFDF5]' },
]

export function paletteAt(index) {
  return CARD_PALETTES[index % CARD_PALETTES.length]
}
