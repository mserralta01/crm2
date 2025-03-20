export type ToastProps = {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
};

export const toast = (props: ToastProps) => {
  console.log(`Toast: ${props.title} - ${props.description}`);
  // Implement a simple toast notification system
  const toastElement = document.createElement('div');
  toastElement.className = `fixed bottom-4 right-4 bg-slate-800 text-white p-4 rounded-md shadow-lg ${
    props.variant === 'destructive' ? 'bg-red-600' : 'bg-slate-800'
  }`;
  
  toastElement.innerHTML = `
    <h4 class="font-semibold">${props.title}</h4>
    <p>${props.description}</p>
  `;
  
  document.body.appendChild(toastElement);
  
  setTimeout(() => {
    toastElement.remove();
  }, 3000);
}; 