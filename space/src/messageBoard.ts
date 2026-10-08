
export default function setScene (
    uuCanvas: HTMLCanvasElement,
    ukCanvas: HTMLCanvasElement,
    kuCanvas: HTMLCanvasElement,
    kkCanvas: HTMLCanvasElement,
    messageBoard: HTMLDListElement,
    signalButton: HTMLButtonElement
) {
    // Selecting elements from the DOM
    const list: HTMLDListElement | null = document.querySelector('dl');
    const term: HTMLElement | null = document.querySelector('dt');
    const description: HTMLElement | null = document.querySelector('dd');

    signalButton.addEventListener('click', () => {
    });
    const eventSource = new EventSource('/events');
    const spoSource = new EventSource('/subject/predicate/object');
    const kSource = new EventSource('/events/known');
    const uSource = new EventSource('/events/unknown');
    const uuSource = new EventSource('/events/unknown/known');
    const ukSource = new EventSource('/events/unknown/known');
    const kuSource = new EventSource('/events/known/unknown');
    const kkSource = new EventSource('/events/known/known');

    eventSource.onopen = () => {
      console.log('Connected to SSE');
    };

    // Handle named events
    eventSource.addEventListener('connected', (event) => {
      const data = JSON.parse(event.data);
      console.log('Connected with client ID:', data.clientId);
    });

    eventSource.addEventListener('update', (event) => {
      const data = JSON.parse(event.data);
      console.log('Received update:', data);
    // Creating elements dynamically
    const myDl = document.createElement('dl'); // Automatically typed as HTMLDListElement
    const myDt = document.createElement('dt'); // Automatically typed as HTMLElement

    });

    // Handle connection errors
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);

      if (eventSource.readyState === EventSource.CONNECTING) {
        console.log('Connection lost, reconnecting automatically');
      } else if (eventSource.readyState === EventSource.CLOSED) {
        console.log('Connection closed');
      }
    };
}