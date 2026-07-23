export interface ProductDescriptionSection {
  title: string;
  content: string;
}

/**
 * `product.description` is a single free-text field (no separate
 * shipping/care/warranty/quality fields on the schema) that CMS operators
 * have been writing as one long run-on paragraph with embedded section
 * labels — e.g. "...Shipping : FREE All India... Care Premium Finish...
 * Warranty Lifetime Warranty...". This splits that back into sections for
 * display without any backend/content migration. Products whose
 * description doesn't contain any of these labels (or is written some
 * other way entirely) just render as a single "Overview" section — this
 * never hides content, only reorganizes it when it recognizes the pattern.
 */
const SECTION_GROUPS: Record<string, string> = {
  'Finishes Available': 'Specifications',
  Warranty: 'Warranty',
  Shipping: 'Shipping & Delivery',
  'Estimated Shipping Time': 'Shipping & Delivery',
  'Free Assembly': 'Shipping & Delivery',
  'Other Cities': 'Shipping & Delivery',
  Assembly: 'Shipping & Delivery',
  Care: 'Care',
  Quality: 'Quality',
};

const SECTION_ORDER = ['Specifications', 'Shipping & Delivery', 'Care', 'Warranty', 'Quality'];

// Longest labels first so "Free Assembly"/"Estimated Shipping Time" match
// before the shorter "Assembly"/"Shipping" they contain.
const HEADER_PATTERN = new RegExp(
  `(${Object.keys(SECTION_GROUPS)
    .sort((a, b) => b.length - a.length)
    .join('|')})\\s*:?`,
  'g',
);

export function parseProductDescription(description: string): ProductDescriptionSection[] {
  const matches = [...description.matchAll(HEADER_PATTERN)];
  if (matches.length === 0) {
    return [{ title: 'Overview', content: description.trim() }];
  }

  const groups = new Map<string, string[]>();
  const overview = description.slice(0, matches[0].index).trim();

  matches.forEach((match, i) => {
    const header = match[1];
    const groupName = SECTION_GROUPS[header] ?? 'Overview';
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? description.length) : description.length;
    const content = description.slice(start, end).trim();
    if (!content) return;
    const existing = groups.get(groupName) ?? [];
    existing.push(content);
    groups.set(groupName, existing);
  });

  const sections: ProductDescriptionSection[] = [];
  if (overview) sections.push({ title: 'Overview', content: overview });
  for (const name of SECTION_ORDER) {
    const parts = groups.get(name);
    if (parts?.length) sections.push({ title: name, content: parts.join(' ') });
  }
  return sections;
}
