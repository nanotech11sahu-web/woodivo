# WOODIVO Enterprise Master Prompt for Claude Code

> Use this document as the single source of truth for the project.

## Objective

Build a **production-ready** platform for **WOODIVO**, a premium wooden products company.

Architecture:

```
woodivo/
├── frontend/   # React + TypeScript + Vite customer website
├── cms/        # React + TypeScript + Vite CMS/Admin
├── backend/    # NestJS + MongoDB REST API
└── docs/
```

## Business

Primary:
- Wooden Temples
- Wooden Doors
- Custom Wooden Products

Secondary:
- Home Interiors
- Wardrobes
- Modular Kitchen
- TV Units
- Wooden Decor

Goal:
- Showcase products
- Generate enquiries
- SEO
- CMS-driven website

## Tech Stack

Frontend & CMS
- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui
- Framer Motion
- TanStack Query
- Axios
- React Hook Form
- Zod

Backend
- NestJS
- MongoDB
- Mongoose
- JWT
- Cloudinary
- Nodemailer

## Rules

- Never hardcode categories.
- Everything comes from APIs.
- Everything editable from CMS.
- No payment gateway.
- No cart or checkout.
- Enterprise architecture.
- Strict TypeScript.
- Reusable components.
- Mobile-first responsive.

## Public Website

Pages:
- Home
- About
- Dynamic Category Listing
- Dynamic Product Details
- Projects
- Gallery
- Blogs
- Blog Details
- Contact
- 404

Homepage sections (CMS managed):
- Hero
- Featured Categories
- Featured Products
- Why Woodivo
- Projects
- Testimonials
- Blogs
- FAQs
- CTA

## Dynamic Categories

Managed only from CMS.

Fields:
- Name
- Slug
- Banner
- Thumbnail
- Description
- SEO
- Display Order
- Status

Automatically appear in header, footer, homepage, filters, search and navigation.

## Products

Fields:
- Category
- Name
- Images
- Description
- Specifications
- SEO
- Featured
- Related Products

CTA:
- Enquire Now
- Get Quote

## Enquiry System

Available from every page.

Simple form:
- Full Name *
- Mobile Number *
- City
- Interested Category (dynamic)
- Message (optional)

On submit:
- Save to MongoDB
- Email admin
- Thank-you popup

## CMS Modules

- Dashboard
- Website Builder
- Banner Management
- Categories
- Products
- Projects
- Gallery
- Blogs
- Testimonials
- FAQs
- Enquiries
- Media Library
- SEO
- Website Settings
- Users & Roles

Everything must be editable from CMS.

## Blog CMS

CRUD, Draft, Publish, Schedule, Rich Text, SEO, Featured Image, Tags, Categories.

Homepage shows latest blogs automatically.

## Website Settings

Manage:
- Logo
- Favicon
- Contact Info
- WhatsApp
- Social Links
- Footer
- Hero Banners

## Performance

- Lazy loading
- Image optimization
- Code splitting
- Clean APIs
- Fast loading

## Workflow

1. Setup backend
2. MongoDB schemas
3. Authentication
4. CMS
5. Public website
6. API integration
7. Responsive polish
8. Testing
9. Production optimization

Build module-by-module. Never generate the whole project in one response.
