import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          padding: '24px',
          width: '400px',
          maxWidth: '90vw',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid #334155',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#ffffff',
          marginBottom: '16px',
        }}>
          {title}
        </h3>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
