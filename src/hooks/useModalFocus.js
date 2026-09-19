import { useEffect, useRef } from 'react';

export default function useModalFocus(isOpen, onClose) {
    const panel = useRef(null);
    const close = useRef(onClose);
    close.current = onClose;
    useEffect(() => {
        if (!isOpen) return;
        const previous = document.activeElement;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const controls = () => [...panel.current.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]')];
        (controls()[0] || panel.current).focus();
        const onKeyDown = event => {
            if (event.key === 'Escape') { event.preventDefault(); close.current(); }
            if (event.key !== 'Tab') return;
            const elements = controls();
            const first = elements[0];
            const last = elements[elements.length - 1];
            if (!first) { event.preventDefault(); return; }
            if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = overflow;
            document.removeEventListener('keydown', onKeyDown);
            previous?.focus();
        };
    }, [isOpen]);
    return panel;
}
