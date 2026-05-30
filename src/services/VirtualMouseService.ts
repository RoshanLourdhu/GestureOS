import type { GestureSettings } from '../types/gesture';
import { useGestureStore } from '../store/gestureStore';

/**
 * VirtualMouseService provides utilities to simulate native mouse interactions
 * based on gesture-derived coordinates. It abstracts element lookup, hover state
 * management, and event dispatching (click, double‑click, drag, etc.).
 */
class VirtualMouseService {
  private lastHoverElement: HTMLElement | null = null;
  private dragElement: HTMLElement | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  /** Returns the topmost interactive element at the given viewport coordinates. */
  private getElementAt(x: number, y: number): HTMLElement | null {
    return document.elementFromPoint(x, y) as HTMLElement | null;
  }

  /** Updates hover state, emits mouseenter / mouseleave as the cursor moves. */
  updateHover(x: number, y: number) {
    const element = this.getElementAt(x, y);
    if (element !== this.lastHoverElement) {
      if (this.lastHoverElement) {
        this.lastHoverElement.dispatchEvent(new MouseEvent('mouseleave', { clientX: x, clientY: y, bubbles: true }));
        this.lastHoverElement.dispatchEvent(new MouseEvent('mouseout', { clientX: x, clientY: y, bubbles: true }));
      }
      if (element) {
        element.dispatchEvent(new MouseEvent('mouseenter', { clientX: x, clientY: y, bubbles: true }));
        element.dispatchEvent(new MouseEvent('mouseover', { clientX: x, clientY: y, bubbles: true }));
      }
      this.lastHoverElement = element;
    }
  }

  /** Simulate a single click at coordinates */
  click(x: number, y: number): boolean {
    const element = this.getElementAt(x, y);
    if (!element) return false;
    const event = new MouseEvent('click', { clientX: x, clientY: y, bubbles: true, cancelable: true, view: window });
    element.dispatchEvent(event);
    if (element.focus) element.focus();
    return true;
  }

  /** Simulate a double‑click */
  doubleClick(x: number, y: number): boolean {
    const element = this.getElementAt(x, y);
    if (!element) return false;
    const event = new MouseEvent('dblclick', { clientX: x, clientY: y, bubbles: true, cancelable: true, view: window });
    element.dispatchEvent(event);
    return true;
  }

  /** Start a drag operation */
  dragStart(x: number, y: number): boolean {
    const element = this.getElementAt(x, y);
    if (!element) return false;
    const dragTarget = element.closest('.draggable-item') as HTMLElement | null;
    if (!dragTarget) return false;
    this.dragElement = dragTarget;
    const rect = dragTarget.getBoundingClientRect();
    this.dragOffsetX = x - rect.left;
    this.dragOffsetY = y - rect.top;
    dragTarget.style.zIndex = '1000';
    dragTarget.classList.add('cursor-grabbing', 'neon-glow-cyan');
    return true;
  }

  /** Continue dragging */
  dragMove(x: number, y: number): boolean {
    if (!this.dragElement) return false;
    const playground = document.getElementById('drag-playground') || document.body;
    const pRect = playground.getBoundingClientRect();
    let left = x - pRect.left - this.dragOffsetX;
    let top = y - pRect.top - this.dragOffsetY;
    const boxRect = this.dragElement.getBoundingClientRect();
    left = Math.max(0, Math.min(pRect.width - boxRect.width, left));
    top = Math.max(0, Math.min(pRect.height - boxRect.height, top));
    this.dragElement.style.position = 'absolute';
    this.dragElement.style.left = `${left}px`;
    this.dragElement.style.top = `${top}px`;
    return true;
  }

  /** End a drag operation and attempt drop */
  dragEnd(x: number, y: number): boolean {
    if (!this.dragElement) return false;
    this.dragElement.classList.remove('cursor-grabbing', 'neon-glow-cyan');
    const targets = document.elementsFromPoint(x, y);
    let dropped = false;
    for (const t of targets) {
      const el = t as HTMLElement;
      if (el.id === 'drop-zone-a' || el.id === 'drop-zone-b') {
        el.appendChild(this.dragElement);
        this.dragElement.style.position = 'relative';
        this.dragElement.style.left = '0';
        this.dragElement.style.top = '0';
        dropped = true;
        el.classList.add('border-green-500', 'bg-green-500/10');
        setTimeout(() => el.classList.remove('border-green-500', 'bg-green-500/10'), 500);
        break;
      }
    }
    if (!dropped) {
      this.dragElement.style.zIndex = '';
    }
    this.dragElement = null;
    return dropped;
  }
}

export const virtualMouseService = new VirtualMouseService();
