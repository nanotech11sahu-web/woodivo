import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import i18n from './lib/i18n';
import { queryClient } from './lib/query-client';
import './index.css';

// Query keys don't carry the active language, so a language switch needs
// an explicit refetch of every cached API response — otherwise switching
// languages after the initial load would leave already-fetched CMS
// content (product/blog/category copy, testimonials, FAQs) showing in
// whatever language was active on first load.
i18n.on('languageChanged', () => {
  void queryClient.invalidateQueries();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
