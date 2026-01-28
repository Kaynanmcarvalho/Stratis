import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, 
  Calendar, 
  MessageSquare, 
  Brain, 
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  ScrollText,
  LucideIcon
} from 'lucide-react';
import './Dock.css';

interface DockItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

const dockItems: DockItem[] = [
  { id: 'dashboard', label: 'Início', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'trabalhos', label: 'Trabalhos', icon: Package, path: '/trabalhos' },
  { id: 'agendamentos', label: 'Agenda', icon: Calendar, path: '/agendamentos' },
  { id: 'funcionarios', label: 'Equipe', icon: Users, path: '/funcionarios' },
  { id: 'relatorios', label: 'Relatórios', icon: FileText, path: '/relatorios' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, path: '/whatsapp' },
  { id: 'ia', label: 'IA', icon: Brain, path: '/ia-config' },
  { id: 'empresas', label: 'Empresas', icon: Building2, path: '/empresas' },
  { id: 'logs', label: 'Logs', icon: ScrollText, path: '/logs' },
];

const VISIBLE_ITEMS = 5;
const ITEM_WIDTH = 72; // Width of each dock item including gap

export const Dock: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastXRef = useRef(0);
  const animationFrameRef = useRef<number>();

  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const maxOffset = Math.max(0, (dockItems.length - VISIBLE_ITEMS) * ITEM_WIDTH);

  const isActive = (path: string) => location.pathname === path;

  // Snap to nearest item
  const snapToNearest = useCallback((currentOffset: number, velocity: number) => {
    const inertia = velocity * 0.3; // Inertia factor
    const targetOffset = currentOffset + inertia;
    const snappedOffset = Math.round(targetOffset / ITEM_WIDTH) * ITEM_WIDTH;
    const clampedOffset = Math.max(0, Math.min(maxOffset, snappedOffset));
    
    return clampedOffset;
  }, [maxOffset]);

  // Animate to target offset
  const animateToOffset = useCallback((targetOffset: number) => {
    const startOffset = currentXRef.current;
    const distance = targetOffset - startOffset;
    const duration = 300; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const newOffset = startOffset + distance * easeProgress;
      currentXRef.current = newOffset;
      setOffset(newOffset);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((clientX: number) => {
    isDraggingRef.current = true;
    startXRef.current = clientX;
    lastXRef.current = clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    setIsDragging(true);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Handle drag move
  const handleDragMove = useCallback((clientX: number) => {
    if (!isDraggingRef.current) return;

    const currentTime = performance.now();
    const deltaX = clientX - lastXRef.current;
    const deltaTime = currentTime - lastTimeRef.current;

    if (deltaTime > 0) {
      velocityRef.current = deltaX / deltaTime;
    }

    const dragDistance = startXRef.current - clientX;
    const newOffset = Math.max(0, Math.min(maxOffset, currentXRef.current + dragDistance));
    
    currentXRef.current = newOffset;
    setOffset(newOffset);
    
    startXRef.current = clientX;
    lastXRef.current = clientX;
    lastTimeRef.current = currentTime;
  }, [maxOffset]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    setIsDragging(false);

    const targetOffset = snapToNearest(currentXRef.current, velocityRef.current);
    animateToOffset(targetOffset);
  }, [snapToNearest, animateToOffset]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  }, [handleDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleDragMove(e.clientX);
  }, [handleDragMove]);

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX);
    }
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      e.preventDefault(); // Prevent scroll
      handleDragMove(e.touches[0].clientX);
    }
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Setup event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Handle item click (only if not dragging)
  const handleItemClick = useCallback((path: string) => {
    if (!isDraggingRef.current && Math.abs(velocityRef.current) < 0.1) {
      navigate(path);
    }
  }, [navigate]);

  return (
    <nav className="dock-container">
      <div 
        ref={containerRef}
        className={`dock ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <div 
          className="dock-track"
          style={{
            transform: `translateX(-${offset}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {dockItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.id}
                className={`dock-item ${active ? 'active' : ''}`}
                onClick={() => handleItemClick(item.path)}
                onMouseDown={(e) => e.stopPropagation()}
                aria-label={item.label}
                style={{
                  pointerEvents: isDragging ? 'none' : 'auto',
                }}
              >
                <div className="dock-item-icon">
                  <Icon className="icon" strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className="dock-item-label">{item.label}</span>
                {active && <div className="dock-item-indicator" />}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Scroll indicators */}
      {offset > 0 && (
        <div className="dock-indicator dock-indicator-left" />
      )}
      {offset < maxOffset && (
        <div className="dock-indicator dock-indicator-right" />
      )}
    </nav>
  );
};
