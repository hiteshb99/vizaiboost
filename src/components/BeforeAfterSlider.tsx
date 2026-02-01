import { useState, useRef, useEffect, MouseEvent, TouchEvent } from "react";
import { Sparkles } from "lucide-react";

interface BeforeAfterSliderProps {
    beforeImage: string;
    afterImage: string;
    className?: string;
    labelBefore?: string;
    labelAfter?: string;
}

export function BeforeAfterSlider({
    beforeImage,
    afterImage,
    className = "",
    labelBefore = "Before",
    labelAfter = "After"
}: BeforeAfterSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            setSliderPosition(percentage);
        }
    };

    const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (isDragging) handleMove(e.clientX);
    };

    const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
        if (isDragging) handleMove(e.touches[0].clientX);
    };

    const onMouseDown = () => setIsDragging(true);
    const onTouchStart = () => setIsDragging(true);
    const onMouseUp = () => setIsDragging(false);

    useEffect(() => {
        const handleGlobalUp = () => setIsDragging(false);
        window.addEventListener("mouseup", handleGlobalUp);
        window.addEventListener("touchend", handleGlobalUp);
        return () => {
            window.removeEventListener("mouseup", handleGlobalUp);
            window.removeEventListener("touchend", handleGlobalUp);
        };
    }, []);

    return (
        <div
            className={`relative w-full overflow-hidden select-none group cursor-ew-resize ${className}`}
            ref={containerRef}
            onMouseMove={onMouseMove}
            onTouchMove={onTouchMove}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
        >
            {/* Background Image (After) - Full width */}
            <img
                src={afterImage}
                alt="After transformation"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
            />

            {/* Label After */}
            <div className="absolute top-4 right-4 bg-primary/90 text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest z-10 shadow-lg">
                {labelAfter}
            </div>

            {/* Foreground Image (Before) - Clipped */}
            <div
                className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white/50 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                style={{ width: `${sliderPosition}%` }}
            >
                <img
                    src={beforeImage}
                    alt="Before transformation"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    // We need to counteract the container width clip to keep image static
                    style={{ width: containerRef.current?.offsetWidth }}
                    draggable={false}
                />

                {/* Label Before */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest z-10">
                    {labelBefore}
                </div>
            </div>

            {/* Slider Handle */}
            <div
                className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-black/10 transform transition-transform group-hover:scale-110">
                    <Sparkles className="w-5 h-5 text-primary fill-current" />
                </div>
            </div>
        </div>
    );
}
