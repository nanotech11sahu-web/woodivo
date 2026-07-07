/**
 * Demo data seeder — NOT wired into `onApplicationBootstrap` like
 * `seeder.service.ts` (the super-admin seed). That one runs on every boot
 * because it's idempotent and harmless to repeat. This one is opt-in only
 * (`npm run seed:demo`), because auto-inserting a few dozen fake products
 * and blog posts into a live production database on every deploy would be
 * actively harmful, not harmless — this script is for turning an empty
 * dev/staging database into something that looks like a real site while
 * building or demoing, not for touching a database with real content in
 * it.
 *
 * Idempotent per-collection: each section checks `countDocuments()` first
 * and skips if that collection already has anything in it, so running
 * this twice (or against a database that already has real content in some
 * collections but not others) never creates duplicates or overwrites
 * anything a real editor already wrote.
 *
 * Every image URL below points at picsum.photos with a fixed seed
 * (`picsum.photos/seed/<name>/<w>/<h>`) — a real, publicly reachable
 * placeholder image service, not a fake/broken URL, so the CMS Media
 * Library previews and the public site's <img> tags both render
 * something real immediately. These are NOT uploaded through Cloudinary
 * (no MediaAsset.publicId is set) — swap them for real product photography
 * via the CMS's own Media Library/upload flow whenever real images are
 * ready; nothing about this script needs to be re-run or undone first.
 *
 * Every `slug` below is set explicitly via `slugify()`, not left for each
 * schema's own `pre('save')` slug-generation hook to fill in. Mongoose
 * runs schema validation *before* `pre('save')` middleware, not after —
 * so a hook that sets a `required` field is too late to satisfy that same
 * field's `required: true` check on a brand-new document. Every existing
 * CRUD service in this project already works around this by computing
 * the slug itself before calling `.create()`/`.save()` (see
 * `CategoriesService.create()`, `ProductsService.create()`, etc.) — this
 * script follows the same pattern for the same reason, not a new one.
 */
import { slugify } from '@common/utils/slugify';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { AppModule } from '../../app.module';

import {
  Category,
  CategoryStatus,
} from '@modules/categories/schemas/category.schema';
import {
  Product,
  ProductStatus,
} from '@modules/products/schemas/product.schema';
import {
  Blog,
  BlogCategory,
  BlogStatus,
} from '@modules/blogs/schemas/blog.schema';
import {
  Project,
  ProjectStatus,
} from '@modules/projects/schemas/project.schema';
import {
  GalleryItem,
  GalleryItemType,
  GalleryItemStatus,
} from '@modules/gallery/schemas/gallery-item.schema';
import {
  Testimonial,
  TestimonialStatus,
} from '@modules/testimonials/schemas/testimonial.schema';
import {
  Banner,
  BannerPlacement,
  BannerStatus,
} from '@modules/banners/schemas/banner.schema';
import { Faq, FaqStatus } from '@modules/faqs/schemas/faq.schema';
import {
  AboutPage,
  ABOUT_PAGE_SINGLETON_KEY,
} from '@modules/about/schemas/about-page.schema';
import {
  WebsiteSettings,
  SETTINGS_SINGLETON_KEY,
  HomepageHighlightIcon,
} from '@modules/settings/schemas/website-settings.schema';

const logger = new Logger('DemoDataSeeder');

function img(seed: string, width: number, height: number, alt: string) {
  return {
    url: `https://picsum.photos/seed/${seed}/${width}/${height}`,
    alt,
  };
}

async function seedCategories(model: Model<Category>) {
  if (await model.countDocuments()) {
    logger.log('Categories already exist — skipping.');
    return model.find().lean();
  }

  const defs = [
    {
      name: 'Dining Tables',
      description:
        'Solid-wood dining tables built to seat a family for decades, not a season.',
      isFeatured: true,
    },
    {
      name: 'Coffee Tables',
      description:
        'Living-room centerpieces in teak, sheesham, and reclaimed wood.',
      isFeatured: true,
    },
    {
      name: 'Wardrobes',
      description:
        'Custom-fit wardrobes and armoires, hand-jointed, no chipboard.',
      isFeatured: true,
    },
    {
      name: 'Bookshelves',
      description:
        'Open and closed bookshelves sized to the room, not a catalog.',
      isFeatured: false,
    },
    {
      name: 'Outdoor Furniture',
      description: 'Weather-treated teak benches, loungers, and dining sets.',
      isFeatured: true,
    },
    {
      name: 'Custom Cabinetry',
      description:
        'Kitchen and study cabinetry built to an exact room measurement.',
      isFeatured: false,
    },
  ];

  const created = await model.create(
    defs.map((d, i) => ({
      name: d.name,
      slug: slugify(d.name),
      description: d.description,
      isFeatured: d.isFeatured,
      displayOrder: i,
      status: CategoryStatus.ACTIVE,
      banner: img(`cat-banner-${i}`, 1600, 500, `${d.name} banner`),
      thumbnail: img(`cat-thumb-${i}`, 600, 750, d.name),
    })),
  );
  logger.log(`Seeded ${created.length} categories.`);
  return created;
}

async function seedProducts(
  model: Model<Product>,
  categories: { _id: Types.ObjectId; name: string }[],
) {
  if (await model.countDocuments()) {
    logger.log('Products already exist — skipping.');
    return;
  }

  const byName = (name: string) =>
    categories.find((c) => c.name === name)?._id ?? categories[0]._id;

  const defs = [
    {
      name: 'Heritage Teak Dining Table',
      category: 'Dining Tables',
      desc: 'Eight-seater teak dining table with a hand-rubbed oil finish.',
    },
    {
      name: 'Compact Sheesham Dining Set',
      category: 'Dining Tables',
      desc: 'Four-seater set built for smaller dining rooms and apartments.',
    },
    {
      name: 'Round Family Dining Table',
      category: 'Dining Tables',
      desc: 'A round six-seater in solid mango wood, extendable leaf included.',
    },
    {
      name: 'Live-Edge Coffee Table',
      category: 'Coffee Tables',
      desc: 'Single-slab live-edge coffee table with hairpin legs.',
    },
    {
      name: 'Nesting Coffee Table Set',
      category: 'Coffee Tables',
      desc: 'Two nesting tables in walnut-stained sheesham.',
    },
    {
      name: 'Storage Coffee Table',
      category: 'Coffee Tables',
      desc: 'Coffee table with a hidden lift-top storage compartment.',
    },
    {
      name: 'Three-Door Sliding Wardrobe',
      category: 'Wardrobes',
      desc: 'Floor-to-ceiling sliding wardrobe with an internal drawer unit.',
    },
    {
      name: 'Classic Hinged Wardrobe',
      category: 'Wardrobes',
      desc: 'Traditional two-door hinged wardrobe with a full-length mirror.',
    },
    {
      name: 'Walk-In Closet System',
      category: 'Wardrobes',
      desc: 'Modular walk-in closet shelving built to room dimensions.',
    },
    {
      name: 'Ladder Bookshelf',
      category: 'Bookshelves',
      desc: 'Leaning ladder-style open bookshelf, five tiers.',
    },
    {
      name: 'Corner Bookshelf Unit',
      category: 'Bookshelves',
      desc: 'Space-saving corner unit for awkward room layouts.',
    },
    {
      name: 'Teak Garden Bench',
      category: 'Outdoor Furniture',
      desc: 'Weather-treated teak bench for patios and gardens.',
    },
    {
      name: 'Outdoor Dining Set',
      category: 'Outdoor Furniture',
      desc: 'Six-seater weatherproof dining set for balconies and lawns.',
    },
    {
      name: 'Reclining Sun Lounger',
      category: 'Outdoor Furniture',
      desc: 'Adjustable teak sun lounger with a matching side table.',
    },
    {
      name: 'Modular Kitchen Cabinet Set',
      category: 'Custom Cabinetry',
      desc: 'Built-to-measure modular kitchen cabinetry.',
    },
    {
      name: 'Study Room Cabinet',
      category: 'Custom Cabinetry',
      desc: 'Built-in study cabinetry with adjustable shelving.',
    },
  ];

  const docs = defs.map((d, i) => ({
    category: byName(d.category),
    name: d.name,
    slug: slugify(d.name),
    description: d.desc,
    images: [
      img(`product-${i}-a`, 900, 900, d.name),
      img(`product-${i}-b`, 900, 900, `${d.name} — alternate angle`),
    ],
    specifications: [
      { key: 'Material', value: 'Solid wood, hand-finished' },
      { key: 'Warranty', value: '2 years against manufacturing defects' },
    ],
    isFeatured: i % 5 === 0,
    displayOrder: i,
    status: ProductStatus.ACTIVE,
  }));

  const created = await model.create(docs);
  logger.log(`Seeded ${created.length} products.`);
}

async function seedBlogs(
  categoryModel: Model<BlogCategory>,
  blogModel: Model<Blog>,
) {
  if (await categoryModel.countDocuments()) {
    logger.log(
      'Blog categories already exist — skipping blog category + blog seed.',
    );
    return;
  }

  const categoryDefs = ['Craftsmanship', 'Care & Maintenance', 'Design Trends'];
  const categories = await categoryModel.create(
    categoryDefs.map((name, i) => ({
      name,
      slug: slugify(name),
      displayOrder: i,
    })),
  );
  logger.log(`Seeded ${categories.length} blog categories.`);

  const byName = (name: string) =>
    categories.find((c) => c.name === name)!._id.toString();

  const defs = [
    {
      title: 'The Art of Hand-Jointed Furniture',
      category: 'Craftsmanship',
      excerpt:
        'Why we still cut dovetail joints by hand instead of relying entirely on machines.',
      content:
        'Every Woodivo piece starts with a single question: does this joint need to last fifty years or five?\n\nHand-cut dovetails take longer than a router jig, but they distribute stress across the joint differently — the wood itself locks the pieces together, not glue and screws alone. For furniture meant to be handed down, that difference matters.\n\nOur workshop still trains every apprentice on hand tools first, machines second. A craftsperson who understands why a joint works by hand makes better decisions about when a machine shortcut is safe to take.',
      featured: true,
    },
    {
      title: 'Choosing the Right Wood for Your Climate',
      category: 'Craftsmanship',
      excerpt:
        'Teak, sheesham, and mango wood each respond differently to humidity — here is how to choose.',
      content:
        'Coastal humidity, dry heat, monsoon swings — Indian climates ask a lot of solid wood furniture.\n\nTeak is naturally resistant to moisture and pests, making it the right call for coastal cities and outdoor pieces. Sheesham is denser and takes detailed carving well, but benefits from a controlled indoor environment. Mango wood is the most affordable of the three and performs well indoors with a good finish.\n\nWe ask about your city before recommending a wood, not after.',
      featured: false,
    },
    {
      title: 'Caring for Solid Wood Furniture Through Monsoon',
      category: 'Care & Maintenance',
      excerpt:
        'Simple habits that keep solid wood furniture from warping or cracking during monsoon season.',
      content:
        'Solid wood moves with the seasons — a little expansion and contraction is normal, not a defect.\n\nKeep furniture a few inches off damp walls and floors, especially during monsoon. Wipe up standing water immediately rather than letting it sit on a wood surface. A light coat of furniture wax every six months keeps the finish sealed against humidity.\n\nAvoid placing pieces directly under an AC vent or in direct sun for long stretches — both dry out wood unevenly and can cause cracking over time.',
      featured: false,
    },
    {
      title: 'A Simple Monthly Cleaning Routine for Wood Furniture',
      category: 'Care & Maintenance',
      excerpt:
        'A five-minute monthly routine that adds years to any solid wood piece.',
      content:
        'Dust with a soft, dry cloth first — always before any liquid touches the surface.\n\nOnce a month, use a wood-safe cleaner (never an all-purpose spray) and buff dry immediately. Check hardware — hinges, drawer slides, table leg bolts — and tighten anything that has loosened.\n\nThat is the whole routine. Solid wood furniture rewards consistency, not intensity.',
      featured: false,
    },
    {
      title: 'Warm Minimalism: The Design Trend Shaping Indian Homes',
      category: 'Design Trends',
      excerpt:
        'Why warm wood tones are replacing stark white minimalism in Indian interiors.',
      content:
        'Minimalism used to mean white walls and glass tables. That is changing.\n\n"Warm minimalism" keeps the clean lines and uncluttered spaces of traditional minimalism, but swaps cold materials for natural wood, woven textures, and softer lighting. It photographs just as well, but it feels considerably more livable day to day.\n\nWe are seeing this most in dining and living room commissions — clients want fewer pieces, but each one built from real material, not veneer.',
      featured: true,
    },
    {
      title: 'Small-Space Furniture: Designing for Apartments',
      category: 'Design Trends',
      excerpt:
        'How to furnish a smaller home without it feeling like a compromise.',
      content:
        'Apartment living does not have to mean flat-pack furniture.\n\nThe right approach is furniture that does more than one job — a coffee table with storage, a dining table that extends only when guests arrive, a bookshelf that doubles as a room divider. Scale matters more than quantity: one well-proportioned solid-wood piece beats three that crowd a room.\n\nWe design several of our smaller pieces specifically with apartment dimensions in mind, not as scaled-down versions of larger furniture.',
      featured: false,
    },
  ];

  const docs = defs.map((d, i) => ({
    title: d.title,
    slug: slugify(d.title),
    excerpt: d.excerpt,
    content: d.content,
    category: byName(d.category),
    featuredImage: img(`blog-${i}`, 1200, 750, d.title),
    tags: [d.category.toLowerCase().replace(/\s+/g, '-')],
    status: BlogStatus.PUBLISHED,
    publishAt: new Date(
      Date.now() - (defs.length - i) * 7 * 24 * 60 * 60 * 1000,
    ),
    isFeatured: d.featured,
    authorName: 'Woodivo Team',
  }));

  const created = await blogModel.create(docs);
  logger.log(`Seeded ${created.length} blogs.`);
}

async function seedProjects(
  model: Model<Project>,
  categories: { _id: Types.ObjectId; name: string }[],
) {
  if (await model.countDocuments()) {
    logger.log('Projects already exist — skipping.');
    return;
  }

  const byName = (name: string) =>
    categories.find((c) => c.name === name)?._id ?? categories[0]._id;

  const defs = [
    {
      title: 'Whitefield Family Residence',
      category: 'Dining Tables',
      client: 'Private Residence',
      location: 'Bengaluru',
      year: '2025',
      desc: 'Full dining and living room furnishing for a four-bedroom home.',
    },
    {
      title: 'Koregaon Park Apartment Refit',
      category: 'Wardrobes',
      client: 'Private Residence',
      location: 'Pune',
      year: '2025',
      desc: 'Custom wardrobe and closet system for a renovated apartment.',
    },
    {
      title: 'Seaside Villa Outdoor Deck',
      category: 'Outdoor Furniture',
      client: 'Private Residence',
      location: 'Goa',
      year: '2024',
      desc: 'Weather-treated teak seating and dining for an oceanfront deck.',
    },
    {
      title: 'Boutique Café Interior',
      category: 'Coffee Tables',
      client: 'Commercial Client',
      location: 'Indore',
      year: '2024',
      desc: 'Custom coffee tables and seating for a 40-seat café.',
    },
    {
      title: 'Home Library Build-Out',
      category: 'Bookshelves',
      client: 'Private Residence',
      location: 'Jaipur',
      year: '2024',
      desc: 'Floor-to-ceiling bookshelf system for a dedicated home library.',
    },
    {
      title: 'Modular Kitchen Renovation',
      category: 'Custom Cabinetry',
      client: 'Private Residence',
      location: 'Ahmedabad',
      year: '2023',
      desc: 'Full kitchen cabinetry replacement in solid wood.',
    },
  ];

  const docs = defs.map((d, i) => ({
    title: d.title,
    slug: slugify(d.title),
    description: d.desc,
    location: d.location,
    completionYear: d.year,
    category: byName(d.category),
    coverImage: img(`project-${i}`, 1200, 900, d.title),
    images: [img(`project-${i}-detail`, 1200, 900, `${d.title} detail`)],
    isFeatured: i < 3,
    displayOrder: i,
    status: ProjectStatus.ACTIVE,
  }));

  const created = await model.create(docs);
  logger.log(`Seeded ${created.length} projects.`);
}

async function seedGallery(model: Model<GalleryItem>) {
  if (await model.countDocuments()) {
    logger.log('Gallery items already exist — skipping.');
    return;
  }

  const tags = [
    ['workshop', 'craftsmanship'],
    ['dining', 'residential'],
    ['outdoor', 'teak'],
    ['workshop', 'hand-tools'],
    ['living-room', 'residential'],
    ['bedroom', 'wardrobe'],
    ['detail', 'joinery'],
    ['commercial', 'café'],
    ['finishing', 'craftsmanship'],
    ['outdoor', 'garden'],
    ['workshop', 'material'],
    ['bookshelf', 'residential'],
  ];

  const docs = tags.map((t, i) => ({
    media: img(`gallery-${i}`, 1000, 1250, `Gallery image ${i + 1}`),
    caption: `Woodivo craftsmanship — ${t[0].replace('-', ' ')}`,
    type: GalleryItemType.IMAGE,
    tags: t,
    displayOrder: i,
    status: GalleryItemStatus.ACTIVE,
  }));

  const created = await model.create(docs);
  logger.log(`Seeded ${created.length} gallery items.`);
}

async function seedTestimonials(model: Model<Testimonial>) {
  if (await model.countDocuments()) {
    logger.log('Testimonials already exist — skipping.');
    return;
  }

  const defs = [
    {
      name: 'Ananya Rao',
      location: 'Bengaluru',
      type: 'Dining Set',
      text: 'The dining table has held up beautifully for two years — still gets compliments from every guest.',
      rating: 5,
    },
    {
      name: 'Rohit Malhotra',
      location: 'Pune',
      type: 'Wardrobe',
      text: 'Our wardrobe was built to fit an oddly-shaped alcove perfectly. The finish quality is well above what we expected for the price.',
      rating: 5,
    },
    {
      name: 'Priya Nair',
      location: 'Goa',
      type: 'Outdoor Furniture',
      text: 'Two monsoons in and the outdoor bench shows zero warping. Exactly what we were told teak would do.',
      rating: 4,
    },
    {
      name: 'Vikram Shah',
      location: 'Ahmedabad',
      type: 'Custom Cabinetry',
      text: 'Communication through the whole project was clear, and the final kitchen cabinetry matched the design drawings exactly.',
      rating: 5,
    },
    {
      name: 'Meera Iyer',
      location: 'Jaipur',
      type: 'Bookshelf',
      text: 'A small custom order but they treated it with the same care as a full-room commission.',
      rating: 5,
    },
  ];

  const docs = defs.map((d, i) => ({
    clientName: d.name,
    clientLocation: d.location,
    projectType: d.type,
    clientPhoto: img(`testimonial-${i}`, 200, 200, d.name),
    testimonialText: d.text,
    rating: d.rating,
    isFeatured: i < 3,
    displayOrder: i,
    status: TestimonialStatus.ACTIVE,
  }));

  const created = await model.create(docs);
  logger.log(`Seeded ${created.length} testimonials.`);
}

async function seedBanners(model: Model<Banner>) {
  if (await model.countDocuments()) {
    logger.log('Banners already exist — skipping.');
    return;
  }

  const defs: {
    placement: BannerPlacement;
    title: string;
    subtitle: string;
  }[] = [
    {
      placement: BannerPlacement.HERO,
      title: 'Handcrafted Furniture, Built to Last Generations',
      subtitle:
        'Solid wood furniture made the slow way — hand-jointed, not mass-produced.',
    },
    {
      placement: BannerPlacement.CATEGORY,
      title: 'Explore Our Collections',
      subtitle: 'Every category, built to order.',
    },
    {
      placement: BannerPlacement.PRODUCT,
      title: 'Every Piece, Custom Made',
      subtitle: 'Solid wood, hand-finished, built to your space.',
    },
    {
      placement: BannerPlacement.BLOG,
      title: 'Stories From the Workshop',
      subtitle: 'Craftsmanship notes, care guides, and design ideas.',
    },
    {
      placement: BannerPlacement.PROJECTS,
      title: 'Projects We\u2019ve Delivered',
      subtitle: 'A look at completed homes and spaces.',
    },
    {
      placement: BannerPlacement.ABOUT,
      title: 'Our Story',
      subtitle: 'Three generations of woodworking craft.',
    },
    {
      placement: BannerPlacement.CONTACT,
      title: 'Let\u2019s Build Something Together',
      subtitle: 'Reach out for a consultation or custom quote.',
    },
  ];

  const docs = defs.map((d, i) => ({
    title: d.title,
    subtitle: d.subtitle,
    desktopImage: img(`banner-${i}`, 1920, 700, d.title),
    mobileImage: img(`banner-${i}-mobile`, 800, 900, d.title),
    ctaLabel:
      d.placement === BannerPlacement.CONTACT ? 'Get in Touch' : 'Explore',
    ctaLink: d.placement === BannerPlacement.CONTACT ? '/contact' : '/products',
    placement: d.placement,
    displayOrder: 0,
    status: BannerStatus.ACTIVE,
  }));

  const created = await model.create(docs);
  logger.log(`Seeded ${created.length} banners (one per placement).`);
}

async function seedFaqs(model: Model<Faq>) {
  if (await model.countDocuments()) {
    logger.log('FAQs already exist — skipping.');
    return;
  }

  const defs: { group: string; q: string; a: string }[] = [
    {
      group: 'General',
      q: 'What wood do you use?',
      a: 'Primarily solid teak, sheesham, and mango wood, chosen per piece based on durability needs and your local climate. We never use particleboard or MDF as a structural material.',
    },
    {
      group: 'General',
      q: 'Do you offer custom sizing?',
      a: 'Yes — every product listing can be adjusted for size, and we regularly build fully custom pieces for specific rooms or alcoves.',
    },
    {
      group: 'Ordering',
      q: 'How long does an order take?',
      a: 'Standard catalog pieces typically ship in 3–4 weeks. Fully custom commissions usually take 6–8 weeks depending on complexity.',
    },
    {
      group: 'Ordering',
      q: 'Can I see the piece before final delivery?',
      a: 'For large custom commissions, we share progress photos at key stages and can arrange a workshop visit on request.',
    },
    {
      group: 'Shipping & Delivery',
      q: 'Do you deliver outside your home city?',
      a: 'Yes, we ship pan-India through vetted furniture logistics partners. Delivery timelines and costs vary by distance.',
    },
    {
      group: 'Shipping & Delivery',
      q: 'Is assembly included?',
      a: 'Yes — every delivery includes on-site assembly and a final quality check by our team before we consider the order complete.',
    },
    {
      group: 'Care',
      q: 'How do I care for solid wood furniture?',
      a: 'Dust regularly with a dry cloth, keep pieces away from direct sun and AC vents, and apply a wood-safe wax every six months. See our blog for a full monsoon care guide.',
    },
    {
      group: 'Care',
      q: 'What is covered under warranty?',
      a: 'All pieces carry a 2-year warranty against manufacturing defects — joinery failure, hardware defects, and finish issues from normal use.',
    },
  ];

  const docs = defs.map((d, i) => ({
    question: d.q,
    answer: d.a,
    group: d.group,
    displayOrder: i,
    status: FaqStatus.ACTIVE,
  }));

  const created = await model.create(docs);
  logger.log(`Seeded ${created.length} FAQs.`);
}

async function seedAboutPage(model: Model<AboutPage>) {
  if (await model.countDocuments({ key: ABOUT_PAGE_SINGLETON_KEY })) {
    logger.log('About page already exists — skipping.');
    return;
  }

  await model.create({
    key: ABOUT_PAGE_SINGLETON_KEY,
    heroTitle: 'Three Generations of Woodworking Craft',
    heroSubtitle: 'From a single workshop to furniture in homes across India.',
    heroImage: img('about-hero', 1920, 800, 'Woodivo workshop'),
    storyTitle: 'How Woodivo Started',
    storyContent:
      'Woodivo began as a single carpentry workshop, three generations ago, building furniture for a handful of families in one neighborhood.\n\nThe tools have changed — we now work alongside CNC precision cutting for the parts that benefit from it — but the standard has not: every joint that matters is still cut and fitted by hand, and every piece is inspected by someone who would be comfortable putting their name on it.\n\nToday we build for homes across India, but the workshop still operates the way it did the first year: one piece at a time, built to be handed down.',
    storyImage: img('about-story', 1200, 900, 'Woodivo craftsman at work'),
    missionText:
      'To build solid wood furniture that outlasts trends, using techniques that respect both the material and the people who make it.',
    visionText:
      'A home furnished entirely in pieces built to be repaired, not replaced — and passed down, not landfilled.',
    values: [
      {
        title: 'Craftsmanship First',
        description:
          'Every joint is built to last, not just to pass inspection.',
      },
      {
        title: 'Honest Materials',
        description:
          'Solid wood only — no particleboard, no veneer sold as solid wood.',
      },
      {
        title: 'Built to Order',
        description:
          'Every piece is built for a specific home, not a warehouse shelf.',
      },
    ],
    milestones: [
      {
        year: '1978',
        title: 'First Workshop Opens',
        description:
          'A single carpentry workshop begins taking custom furniture orders.',
      },
      {
        year: '2005',
        title: 'Second Generation Takes Over',
        description: 'The workshop expands to a dedicated production facility.',
      },
      {
        year: '2020',
        title: 'Woodivo Launches Online',
        description:
          'Furniture becomes available beyond word-of-mouth, pan-India.',
      },
    ],
    teamTitle: 'The People Behind the Craft',
    teamSubtitle: 'A small team, each with a specific craft.',
    teamMembers: [
      {
        name: 'Arvind Kumar',
        role: 'Founder & Master Craftsman',
        photo: img('team-1', 400, 400, 'Arvind Kumar'),
        bio: 'Three decades of hand-joinery experience, trained under his father in the original workshop.',
      },
      {
        name: 'Sunita Desai',
        role: 'Head of Design',
        photo: img('team-2', 400, 400, 'Sunita Desai'),
        bio: 'Leads every custom commission from first sketch to final finish selection.',
      },
      {
        name: 'Farhan Ali',
        role: 'Workshop Manager',
        photo: img('team-3', 400, 400, 'Farhan Ali'),
        bio: 'Oversees quality control on every piece before it leaves the workshop.',
      },
    ],
    ctaTitle: 'Ready to Build Something Together?',
    ctaText:
      'Reach out for a consultation on your next piece, custom or catalog.',
  });
  logger.log('Seeded About page.');
}

async function seedWebsiteSettings(model: Model<WebsiteSettings>) {
  const existing = await model.findOne({ key: SETTINGS_SINGLETON_KEY });

  const homepagePoints = [
    {
      icon: HomepageHighlightIcon.TREE_PINE,
      title: 'Solid Wood Only',
      description:
        'No particleboard or veneer — every piece is genuine solid wood.',
    },
    {
      icon: HomepageHighlightIcon.HAMMER,
      title: 'Hand-Jointed',
      description:
        'Load-bearing joints are still hand-cut, not just glued and screwed.',
    },
    {
      icon: HomepageHighlightIcon.SHIELD_CHECK,
      title: '2-Year Warranty',
      description: 'Every piece is covered against manufacturing defects.',
    },
    {
      icon: HomepageHighlightIcon.TRUCK,
      title: 'Pan-India Delivery',
      description:
        'Delivered and assembled on-site by our own logistics partners.',
    },
  ];

  if (existing) {
    // Only fills in fields that are genuinely empty on an existing
    // settings doc (a fresh install creates this singleton with mostly
    // blank fields on first CMS save) — never overwrites contact info,
    // branding, or homepage content someone has already configured.
    let changed = false;
    if (!existing.contact?.phone && !existing.contact?.email) {
      existing.contact = {
        phone: '+91 98765 43210',
        whatsapp: '+91 98765 43210',
        email: 'hello@woodivo.example',
        address: '14 Workshop Lane, Industrial Area',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pincode: '452001',
      };
      changed = true;
    }
    if (!existing.footer?.aboutText) {
      existing.footer = {
        aboutText:
          'Handcrafted solid wood furniture, built to order since 1978.',
        copyrightText: `© ${new Date().getFullYear()} Woodivo. All rights reserved.`,
      };
      changed = true;
    }
    if (!existing.homepage?.whyWoodivoPoints?.length) {
      existing.homepage = { whyWoodivoPoints: homepagePoints };
      changed = true;
    }
    if (!existing.tagline) {
      existing.tagline = 'Handcrafted Furniture, Built to Last Generations';
      changed = true;
    }
    if (changed) {
      await existing.save();
      logger.log('Filled in empty fields on existing website settings.');
    } else {
      logger.log('Website settings already fully configured — skipping.');
    }
    return;
  }

  await model.create({
    key: SETTINGS_SINGLETON_KEY,
    siteName: 'Woodivo',
    tagline: 'Handcrafted Furniture, Built to Last Generations',
    contact: {
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      email: 'hello@woodivo.example',
      address: '14 Workshop Lane, Industrial Area',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '452001',
    },
    socialLinks: {
      facebook: 'https://facebook.com/woodivo',
      instagram: 'https://instagram.com/woodivo',
    },
    footer: {
      aboutText: 'Handcrafted solid wood furniture, built to order since 1978.',
      copyrightText: `© ${new Date().getFullYear()} Woodivo. All rights reserved.`,
    },
    homepage: { whyWoodivoPoints: homepagePoints },
  });
  logger.log('Seeded website settings.');
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['warn', 'error'],
  });

  try {
    const categoryModel = app.get<Model<Category>>(
      getModelToken(Category.name),
    );
    const productModel = app.get<Model<Product>>(getModelToken(Product.name));
    const blogCategoryModel = app.get<Model<BlogCategory>>(
      getModelToken(BlogCategory.name),
    );
    const blogModel = app.get<Model<Blog>>(getModelToken(Blog.name));
    const projectModel = app.get<Model<Project>>(getModelToken(Project.name));
    const galleryModel = app.get<Model<GalleryItem>>(
      getModelToken(GalleryItem.name),
    );
    const testimonialModel = app.get<Model<Testimonial>>(
      getModelToken(Testimonial.name),
    );
    const bannerModel = app.get<Model<Banner>>(getModelToken(Banner.name));
    const faqModel = app.get<Model<Faq>>(getModelToken(Faq.name));
    const aboutModel = app.get<Model<AboutPage>>(getModelToken(AboutPage.name));
    const settingsModel = app.get<Model<WebsiteSettings>>(
      getModelToken(WebsiteSettings.name),
    );

    const categories = await seedCategories(categoryModel);
    await seedProducts(productModel, categories);
    await seedBlogs(blogCategoryModel, blogModel);
    await seedProjects(projectModel, categories);
    await seedGallery(galleryModel);
    await seedTestimonials(testimonialModel);
    await seedBanners(bannerModel);
    await seedFaqs(faqModel);
    await seedAboutPage(aboutModel);
    await seedWebsiteSettings(settingsModel);

    logger.log('Demo data seed complete.');
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: unknown) => {
  logger.error(
    'Demo data seed failed',
    error instanceof Error ? error.stack : error,
  );
  process.exitCode = 1;
});
