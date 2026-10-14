const frame = document.querySelector<HTMLIFrameElement>('#world')!;
const source = document.querySelector<HTMLInputElement>('#src')!;
const open = document.querySelector<HTMLAnchorElement>('#open')!;
const status = document.querySelector<HTMLElement>('#status')!;
const connect = document.querySelector<HTMLButtonElement>('#connect')!;

function validSource(value: string) {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && ['localhost', '127.0.0.1'].includes(url.hostname);
  } catch {
    return false;
  }
}

function connectWorld() {
  const value = source.value.trim();
  if (!validSource(value)) {
    status.textContent = 'Use a localhost or 127.0.0.1 client URL.';
    return;
  }
  frame.src = value;
  open.href = value;
  status.textContent = `Connecting to ${new URL(value).host}…`;
}

frame.addEventListener('load', () => { status.textContent = `Connected to ${new URL(frame.src).host}.`; });
connect.addEventListener('click', connectWorld);
source.addEventListener('keydown', (event) => { if (event.key === 'Enter') connectWorld(); });

async function loadEnvironment() {
  try {
    const response = await fetch('./environment.json', { cache: 'no-store' });
    if (!response.ok) return;
    const environment = await response.json() as { runtime?: { clientUrl?: string } };
    const clientUrl = environment.runtime?.clientUrl;
    if (clientUrl && validSource(clientUrl)) {
      source.value = clientUrl;
      connectWorld();
    }
  } catch {
    // The static room keeps its localhost default when no manifest is served.
  }
}
void loadEnvironment();
