import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = usePostApiAuthLogin({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getGetApiAuthMeQueryKey() });
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

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-100 p-4 font-sans antialiased">
      {/* Sharp Clean Card matching Dashboard Theme */}
      <Card className="w-full max-w-[400px] !bg-white !border !border-slate-200 !rounded-md !shadow-sm !p-8 flex flex-col gap-6">
        <CardHeader
          header={
            <div className="flex flex-col items-center gap-3 w-full text-center">
              {/* Brand Icon Matching Sidebar */}
              <div className="p-2.5 rounded-md bg-[#0B132B] text-white">
                <Building24Filled />
              </div>
              <div className="flex flex-col gap-1">
                <Text weight="bold" className="text-xl text-slate-900 tracking-tight">
                  Employee MS
                </Text>
                <Text size={200} className="text-slate-500 font-medium">
                  Sign in to your account
                </Text>
              </div>
            </div>
          }
        />

        {loginMutation.isError && (
          <MessageBar intent="error" shape="square" className="!rounded-sm">
            <MessageBarBody>
              {(loginMutation.error as Error)?.message ?? 'Invalid email or password'}
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

        <div className="w-full h-px bg-slate-200" />

        <CardFooter className="justify-center !p-0">
          <Text size={200} className="text-slate-500">
            Need assistance? <Link href="#" className="!text-blue-600 hover:!underline font-medium">Contact IT Support</Link>
          </Text>
        </CardFooter>
      </Card>
    </div>
  );
}