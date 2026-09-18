import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Avatar,
  FluentProvider,
  webLightTheme,
  makeStyles,
} from '@fluentui/react-components';
import {
  MailRegular,
  LockClosedRegular,
  EyeRegular,
  EyeOffRegular,
  BuildingPeople24Filled,
} from '@fluentui/react-icons';

import { usePostApiAuthLogin } from '../../../api/generated/auth/auth';

const loginSchema = z.object({
  email: z.string().min(1, 'Enter your email').email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

const useStyles = makeStyles({
  pageContainer: {
    position: 'relative',
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #dbeafe 100%)',
    overflow: 'hidden',
    padding: '16px',
    boxSizing: 'border-box',
  },
  glowTopLeft: {
    position: 'absolute',
    top: '10%',
    left: '15%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(224, 242, 254, 0) 70%)',
    filter: 'blur(70px)',
    pointerEvents: 'none',
    '@media (max-width: 600px)': {
      display: 'none',
    },
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: '10%',
    right: '15%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(219, 234, 254, 0) 70%)',
    filter: 'blur(70px)',
    pointerEvents: 'none',
    '@media (max-width: 600px)': {
      display: 'none',
    },
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    borderRadius: '24px',
    boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(255, 255, 255, 0.8)',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxSizing: 'border-box',
    '@media (max-width: 600px)': {
      padding: '20px',
      borderRadius: '16px',
      maxWidth: '100%',
    },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    borderRadius: '10px',
    border: '1px solid rgba(203, 213, 225, 0.6)',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    border: 'none',
    color: '#ffffff',
    borderRadius: '12px',
    height: '46px',
    fontWeight: '600',
    fontSize: '15px',
    boxShadow: '0 10px 20px -3px rgba(37, 99, 235, 0.3)',
    cursor: 'pointer',
    marginTop: '6px',
    '&:hover': {
      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
      color: '#ffffff',
    },
  },
  avatar: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
  },
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
  },
  textHeader: {
    color: '#0f172a',
  },
  textLabel: {
    color: '#334155',
  },
  textMuted: {
    color: '#64748b',
  },
  textLink: {
    color: '#2563eb',
  },
  cardFooter: {
    justifyContent: 'center',
    padding: 0,
  },
});

export function LoginForm() {
  const styles = useStyles();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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
      onSuccess: (response) => {
        const authData = response.data.data;
        if (authData?.accessToken) {
          localStorage.setItem('accessToken', authData.accessToken);
          if (authData.refreshToken) localStorage.setItem('refreshToken', authData.refreshToken);
          navigate('/dashboard');
        }
      },
    },
  });

  const onSubmit = (values: LoginValues) => {
    loginMutation.mutate({ data: { email: values.email, password: values.password } });
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.pageContainer}>
        <div className={styles.glowTopLeft} />
        <div className={styles.glowBottomRight} />

        <Card className={styles.card} size="large">
          <CardHeader
            header={
              <div style={{ textAlign: 'center', width: '100%' }}>
                <Text weight="bold" size={600} className={styles.textHeader}>
                  Welcome back
                </Text>
              </div>
            }
            description={
              <div style={{ textAlign: 'center', width: '100%' }}>
                <Text size={300} className={styles.textMuted}>
                  Sign in to access your HR workspace
                </Text>
              </div>
            }
          />

          {loginMutation.isError && (
            <MessageBar intent="error" shape="rounded">
              <MessageBarBody>
                {(loginMutation.error as Error)?.message ?? 'Invalid email or password'}
              </MessageBarBody>
            </MessageBar>
          )}

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Field
                  label={<Text weight="semibold" size={200} className={styles.textLabel}>Work Email</Text>}
                  validationState={errors.email ? 'error' : 'none'}
                  validationMessage={errors.email?.message}
                  required
                >
                  <Input
                    {...field}
                    type="email"
                    size="large"
                    className={styles.input}
                    contentBefore={<MailRegular className={styles.textMuted} />}
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
                  label={<Text weight="semibold" size={200} className={styles.textLabel}>Password</Text>}
                  validationState={errors.password ? 'error' : 'none'}
                  validationMessage={errors.password?.message}
                  required
                >
                  <Input
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    size="large"
                    className={styles.input}
                    contentBefore={<LockClosedRegular className={styles.textMuted} />}
                    contentAfter={
                      <Button
                        appearance="transparent"
                        icon={showPassword ? <EyeOffRegular className={styles.textMuted} /> : <EyeRegular className={styles.textMuted} />}
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
              size="large"
              className={styles.submitBtn}
              disabled={loginMutation.isPending}
              icon={loginMutation.isPending ? <Spinner size="tiny" /> : undefined}
            >
              {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className={styles.divider} />

          <CardFooter className={styles.cardFooter}>
            <Text size={200} className={styles.textMuted}>
              Need assistance? <Link href="#" className={styles.textLink}>Contact IT Support</Link>
            </Text>
          </CardFooter>
        </Card>
      </div>
    </FluentProvider>
  );
}