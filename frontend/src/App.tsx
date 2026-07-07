import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { EnquiryDialogProvider } from '@/features/enquiry/enquiry-dialog-context';
import { router } from './routes';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EnquiryDialogProvider>
        <RouterProvider router={router} />
      </EnquiryDialogProvider>
    </QueryClientProvider>
  );
}
