type Listener = () => void;

const listeners = new Set<Listener>();

/** Avisa que algo mudou no banco local (para agendar a sincronização). */
export function notifyLocalChange(): void {
  for (const listener of listeners) listener();
}

export function subscribeToLocalChanges(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
