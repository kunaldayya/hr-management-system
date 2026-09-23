import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import {
  Card,
  CardHeader,
  CardFooter,
  Field,
  Input,
  Button,
  Link,
  Text,
  MessageBar,
  MessageBarBody,
  Spinner,
} from '@fluentui/react-components';
import {
  MailRegular,
  LockClosedRegular,
  EyeRegular,
  EyeOffRegular,
  Building24Filled,
} from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { usePostApiAuthLogin, getGetApiAuthMeQueryKey } from '../../api/generated/auth/auth';

const loginSchema = z.object({
  email: z.string().min(1, 'Enter your email').email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

const DEMO_CREDENTIALS = [
  { label: 'Admin', email: 'admin@hrms.com', password: 'Password123!' },
  { label: 'HR',    email: 'hr@hrms.com',    password: 'Password123!' },
  { label: 'Employee', email: 'employee@hrms.com', password: 'Password123!' },
] as const;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = usePostApiAuthLogin({
    mutation: {
      onSuccess: async (response) => {
        // Save access token so axios-instance can attach Authorization: Bearer header
        const token = (response as any)?.data?.accessToken ?? (response as any)?.accessToken;
        if (token) {
          localStorage.setItem('accessToken', token);
        }
        queryClient.clear();
        await queryClient.refetchQueries({ queryKey: getGetApiAuthMeQueryKey() });
        navigate('/dashboard', { replace: true });
      },
      onError: (error) => {
        console.error('Login failed:', error);
      },
    },
  });

  const onSubmit = (values: LoginValues) => {
    loginMutation.mutate({ data: values });
  };

  const fillDemo = (email: string, password: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-100 p-4 font-sans antialiased">
      <Card className="w-full max-w-[420px] !bg-white !border !border-slate-200 !rounded-md !shadow-sm !p-8 flex flex-col gap-5">
        <CardHeader
          header={
            <div className="flex flex-col items-center gap-3 w-full text-center">
              <div className="p-2.5 rounded-md bg-[#0B132B] text-white">
                <Building24Filled />
              </div>
              <div className="flex flex-col gap-1">
                <Text weight="bold" className="text-xl text-slate-900 tracking-tight">
                  HR Management System
                </Text>
                <Text size={200} className="text-slate-500 font-medium">
                  Sign in to your account
                </Text>
              </div>
            </div>
          }
        />

        {/* Demo credential quick-fill buttons */}
        <div className="flex flex-col gap-1.5">
          <Text size={100} className="text-xs text-slate-400 uppercase tracking-wider font-semibold text-center">
            Quick Sign-In (Demo)
          </Text>
          <div className="flex gap-2">
            {DEMO_CREDENTIALS.map(({ label, email, password }) => (
              <button
                key={label}
                type="button"
                onClick={() => fillDemo(email, password)}
                className="flex-1 text-xs py-1.5 px-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-slate-200" />

        {loginMutation.isError && (
          <MessageBar intent="error" shape="square" className="!rounded-sm">
            <MessageBarBody>
              {(loginMutation.error as any)?.response?.data?.message
                ?? (loginMutation.error as Error)?.message
                ?? 'Invalid email or password'}
            </MessageBarBody>
          </MessageBar>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Field
                label={<Text className="text-xs font-semibold uppercase tracking-wider text-slate-600">Work Email</Text>}
                validationState={errors.email ? 'error' : 'none'}
                validationMessage={errors.email?.message}
                required
              >
                <Input
                  {...field}
                  type="email"
                  size="medium"
                  className="!rounded-sm !border-slate-300 focus:!border-blue-600"
                  contentBefore={<MailRegular className="text-slate-400" />}
                  placeholder="name@company.com"
                  autoComplete="username"
                />
              </Field>
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Field
                label={<Text className="text-xs font-semibold uppercase tracking-wider text-slate-600">Password</Text>}
                validationState={errors.password ? 'error' : 'none'}
                validationMessage={errors.password?.message}
                required
              >
                <Input
                  {...field}
                  type={showPassword ? 'text' : 'password'}
                  size="medium"
                  className="!rounded-sm !border-slate-300 focus:!border-blue-600"
                  contentBefore={<LockClosedRegular className="text-slate-400" />}
                  contentAfter={
                    <Button
                      appearance="transparent"
                      icon={showPassword ? <EyeOffRegular className="text-slate-400" /> : <EyeRegular className="text-slate-400" />}
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      type="button"
                    />
                  }
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </Field>
            )}
          />

          <Button
            type="submit"
            appearance="primary"
            className="!bg-blue-600 hover:!bg-blue-700 !text-white !rounded-sm !h-10 !font-medium !mt-2"
            disabled={loginMutation.isPending}
            icon={loginMutation.isPending ? <Spinner size="tiny" /> : undefined}
          >
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <CardFooter className="justify-center !p-0">
          <Text size={200} className="text-slate-500">
            Need assistance? <Link href="#" className="!text-blue-600 hover:!underline font-medium">Contact IT Support</Link>
          </Text>
        </CardFooter>
      </Card>
    </div>
  );
}