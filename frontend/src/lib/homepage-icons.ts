import {
  Award,
  Clock,
  Hammer,
  Leaf,
  Package,
  PenTool,
  Ruler,
  ShieldCheck,
  ThumbsUp,
  TreePine,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { HomepageHighlightIcon } from '@/types/settings';

/**
 * Explicit key -> component map, not a string-indexed `Icons[value]`
 * lookup into `lucide-react`'s full export surface — `icon` is
 * CMS-entered data (validated server-side against
 * `HomepageHighlightIcon`, but this is still the boundary where
 * persisted-string-becomes-rendered-component happens), so the mapping
 * stays a small, reviewable table rather than trusting the string
 * directly as an import key.
 */
export const HOMEPAGE_ICON_MAP: Record<HomepageHighlightIcon, LucideIcon> = {
  'tree-pine': TreePine,
  ruler: Ruler,
  hammer: Hammer,
  truck: Truck,
  'shield-check': ShieldCheck,
  award: Award,
  leaf: Leaf,
  clock: Clock,
  'thumbs-up': ThumbsUp,
  'pen-tool': PenTool,
  package: Package,
  users: Users,
};
