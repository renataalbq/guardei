import { useState, type FormEvent } from 'react';
import { AccountError } from '../../data/sync/accountService';
import { FormField, textInputClassName } from '../ui/FormField';

interface EmailCodeFormProps {
  emailLabel: string;
  sendLabel: string;
  confirmLabel: string;
  requestCode: (email: string) => Promise<void>;
  confirmCode: (email: string, code: string) => Promise<void>;
  onConfirmed?: () => void;
}

function messageOf(error: unknown): string {
  return error instanceof AccountError ? error.message : 'Algo deu errado. Tente de novo em instantes.';
}

/** Dois passos: e-mail → código de 6 dígitos recebido por e-mail (funciona dentro do app instalado). */
export function EmailCodeForm({ emailLabel, sendLabel, confirmLabel, requestCode, confirmCode, onConfirmed }: EmailCodeFormProps) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function run(action: () => Promise<void>) {
    setIsBusy(true);
    setError(undefined);
    try {
      await action();
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setIsBusy(false);
    }
  }

  function handleSendCode(event: FormEvent) {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) {
      setError('Confira o e-mail digitado.');
      return;
    }
    void run(async () => {
      await requestCode(trimmed);
      setEmail(trimmed);
      setCode('');
      setStep('code');
    });
  }

  function handleConfirm(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      await confirmCode(email, code.trim());
      onConfirmed?.();
    });
  }

  const buttonClassName = 'btn-primary w-full py-3.5';

  if (step === 'email') {
    return (
      <form onSubmit={handleSendCode} noValidate className="flex flex-col gap-3">
        <FormField label={emailLabel} htmlFor="account-email" error={error}>
          <input
            id="account-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            enterKeyHint="send"
            placeholder="voce@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={textInputClassName}
          />
        </FormField>
        <button type="submit" disabled={isBusy} className={buttonClassName}>
          {isBusy ? 'Enviando…' : sendLabel}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleConfirm} noValidate className="flex flex-col gap-3">
      <FormField
        label="Código recebido por e-mail"
        htmlFor="account-code"
        hint={`Enviamos um código para ${email}. Olhe também a caixa de spam.`}
        error={error}
      >
        <input
          id="account-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          enterKeyHint="done"
          maxLength={10}
          placeholder="123456"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
          className={`${textInputClassName} text-center text-2xl tracking-[0.4em]`}
        />
      </FormField>
      <button type="submit" disabled={isBusy || code.length < 6} className={buttonClassName}>
        {isBusy ? 'Confirmando…' : confirmLabel}
      </button>
      <div className="flex justify-between text-sm">
        <button type="button" onClick={() => setStep('email')} className="font-medium text-muted underline underline-offset-2">
          Trocar e-mail
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => void run(() => requestCode(email))}
          className="font-medium text-ink underline underline-offset-2"
        >
          Reenviar código
        </button>
      </div>
    </form>
  );
}
