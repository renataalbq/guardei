import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { EmailCodeForm } from '../components/account/EmailCodeForm';
import { SyncStatusLine } from '../components/account/SyncStatusLine';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Icon } from '../components/ui/Icon';
import { AccountError, type AccountService } from '../data/sync/accountService';
import { accountService } from '../data/sync/cloudSync';
import { useAccount } from '../hooks/useAccount';
import { useSyncStatus } from '../hooks/useSyncStatus';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <h2 className="font-hand text-3xl font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function AnonymousAccount({ service }: { service: AccountService }) {
  const [mode, setMode] = useState<'protect' | 'sign-in'>('protect');
  const [protectedNow, setProtectedNow] = useState(false);

  if (protectedNow) {
    return (
      <Section title="Conta protegida!">
        <p className="text-sm text-fg">Agora você pode entrar com esse e-mail em qualquer celular e continuar de onde parou.</p>
      </Section>
    );
  }

  if (mode === 'sign-in') {
    return (
      <Section title="Entrar na minha conta">
        <p className="text-sm text-muted">
          Use o e-mail da conta que você já tem. Os desafios criados neste aparelho serão juntados aos da sua conta.
        </p>
        <EmailCodeForm
          emailLabel="E-mail da sua conta"
          sendLabel="Enviar código"
          confirmLabel="Entrar"
          requestCode={service.requestSignInCode}
          confirmCode={service.confirmSignInCode}
        />
        <button type="button" onClick={() => setMode('protect')} className="text-sm font-medium text-muted underline underline-offset-2">
          Voltar
        </button>
      </Section>
    );
  }

  return (
    <Section title="Proteja seu progresso">
      <p className="text-sm text-fg">
        Seus desafios já são salvos na nuvem automaticamente. Adicione um e-mail para recuperar tudo se trocar ou perder o celular. Sem
        senha: você recebe um código para confirmar.
      </p>
      <EmailCodeForm
        emailLabel="Seu e-mail"
        sendLabel="Enviar código"
        confirmLabel="Confirmar e-mail"
        requestCode={service.requestProtectAccountCode}
        confirmCode={service.confirmProtectAccountCode}
        onConfirmed={() => setProtectedNow(true)}
      />
      <button type="button" onClick={() => setMode('sign-in')} className="text-sm font-medium text-ink underline underline-offset-2">
        Já tenho conta (entrar em outro celular)
      </button>
    </Section>
  );
}

function SignedInAccount({ service, email }: { service: AccountService; email: string | undefined }) {
  const navigate = useNavigate();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function signOut() {
    setConfirmingSignOut(false);
    setError(undefined);
    try {
      await service.signOut();
      navigate('/', { replace: true });
    } catch (caught) {
      setError(caught instanceof AccountError ? caught.message : 'Não foi possível sair agora. Tente de novo.');
    }
  }

  return (
    <Section title="Sua conta">
      <p className="text-sm text-fg">
        Conectado como <strong>{email}</strong>. Para usar em outro celular, entre com esse e-mail.
      </p>
      {error && <p className="text-sm font-medium text-red-700">{error}</p>}
      <button
        type="button"
        onClick={() => setConfirmingSignOut(true)}
        className="rounded-xl border border-border py-3 font-semibold text-fg active:scale-[0.98]"
      >
        Sair deste aparelho
      </button>
      <ConfirmDialog
        open={confirmingSignOut}
        title="Sair deste aparelho?"
        description="Seus desafios continuam salvos na nuvem. Para vê-los de novo aqui, entre com o mesmo e-mail."
        confirmLabel="Sair"
        onCancel={() => setConfirmingSignOut(false)}
        onConfirm={() => void signOut()}
      />
    </Section>
  );
}

export function AccountPage() {
  const accountState = useAccount();
  const syncStatus = useSyncStatus();

  return (
    <main className="mx-auto min-h-dvh max-w-xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-10">
      <header className="flex items-center gap-2 py-2">
        <Link to="/" aria-label="Voltar" className="-ml-2 rounded-full p-2 text-2xl text-ink active:bg-ink-soft">
          <Icon name="back" />
        </Link>
        <h1 className="font-hand text-4xl font-bold text-ink">Conta e nuvem</h1>
      </header>

      <div className="mt-4 flex flex-col gap-4">
        <SyncStatusLine status={syncStatus} />
        {accountState.status === 'ready' && accountService && (
          accountState.account === null ? (
            <p className="text-sm text-muted">Assim que houver internet, sua conta é criada automaticamente.</p>
          ) : accountState.account.isAnonymous ? (
            <AnonymousAccount service={accountService} />
          ) : (
            <SignedInAccount service={accountService} email={accountState.account.email} />
          )
        )}
      </div>
    </main>
  );
}
