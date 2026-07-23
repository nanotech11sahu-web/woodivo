import {
  LayoutDashboard,
  FolderTree,
  Layers,
  Package,
  Inbox,
  Newspaper,
  Image,
  Images,
  MessageSquareQuote,
  HelpCircle,
  GalleryHorizontal,
  Hammer,
  Settings,
  Users,
  BookUser,
  Search,
  Wand2,
  Share2,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/categories', label: 'Categories', icon: FolderTree },
      { to: '/subcategories', label: 'Subcategories', icon: Layers },
      { to: '/products', label: 'Products', icon: Package },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/blogs', label: 'Blogs', icon: Newspaper },
      { to: '/gallery', label: 'Gallery', icon: Image },
      { to: '/customizations', label: 'Customizations', icon: Hammer },
      { to: '/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
      { to: '/faqs', label: 'FAQs', icon: HelpCircle },
      { to: '/banners', label: 'Banners', icon: GalleryHorizontal },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/social', label: 'Social Posts', icon: Share2 },
      { to: '/enquiries', label: 'Enquiries', icon: Inbox },
      { to: '/users', label: 'Users & Roles', icon: Users },
      { to: '/media', label: 'Media Library', icon: Images },
      { to: '/tools', label: 'Blog Tools', icon: Wand2 },
      { to: '/settings', label: 'Website Settings', icon: Settings },
      { to: '/about-page', label: 'About Page', icon: BookUser },
      { to: '/seo', label: 'SEO', icon: Search },
    ],
  },
];

const ALL_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

/** Longest-matching-prefix lookup so `/products/123` still resolves to "Products". */
export function titleForPath(pathname: string): string {
  const match = ALL_ITEMS.filter(
    (item) => pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to)),
  ).sort((a, b) => b.to.length - a.to.length)[0];

  return match?.label ?? 'WOODIVO CMS';
}
