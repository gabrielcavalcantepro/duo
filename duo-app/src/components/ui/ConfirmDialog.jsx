import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, danger = false, loading = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || 'Confirmar'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} fullWidth>Cancelar</Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            fullWidth
          >
            Confirmar
          </Button>
        </>
      }
    >
      <p className="font-sans text-base text-[var(--ink-soft)] py-2">{message}</p>
    </Modal>
  );
}
