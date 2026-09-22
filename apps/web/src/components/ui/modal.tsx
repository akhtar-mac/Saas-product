import React from 'react';
import { CrmModal } from './crm-modal';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  icon?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children, size = 'md', icon }: ModalProps) {
  return (
    <CrmModal
      isOpen={isOpen}
      onClose={onClose}
      title={title ?? ''}
      description={description}
      size={size === 'full' ? '2xl' : size}
      icon={icon}
    >
      {children}
    </CrmModal>
  );
}

export default Modal;
