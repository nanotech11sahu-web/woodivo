import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from './auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await login(values.email, values.password);
      navigate(redirectTo, { replace: true });
    } catch {
      setServerError('That email and password combination is incorrect.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-1 w-12 rounded-full bg-gradient-to-r from-walnut-light via-walnut to-walnut-dark" />
          <h1 className="font-display text-3xl font-semibold text-espresso">
            WOODIVO
          </h1>
          <p className="mt-1 text-sm text-ink-muted">Sign in to the CMS</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-card border border-border-warm bg-card p-6 shadow-sm"
          noValidate
        >
          {serverError && (
            <div
              role="alert"
              className="mb-4 rounded-md bg-rust-light px-3 py-2 text-sm text-rust"
            >
              {serverError}
            </div>
          )}

          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@woodivo.com"
              className="mt-1.5"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rust">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-6">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="mt-1.5"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-rust">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="text-white" /> : 'Sign in'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
