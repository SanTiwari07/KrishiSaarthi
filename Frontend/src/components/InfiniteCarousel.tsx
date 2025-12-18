import React from 'react';

interface InfiniteCarouselProps {
    images: string[];
}

export default function InfiniteCarousel({ images }: InfiniteCarouselProps) {
    return (
        <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-scroll">
                {images.map((src, index) => (
                    <li key={index}>
                        <img
                            src={src}
                            alt={`carousel-item-${index}`}
                            className="h-[300px] md:h-[400px] rounded-2xl object-cover shadow-lg hover:scale-105 transition-transform duration-300"
                        />
                    </li>
                ))}
            </ul>
            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-scroll" aria-hidden="true">
                {images.map((src, index) => (
                    <li key={index}>
                        <img
                            src={src}
                            alt={`carousel-item-${index}`}
                            className="h-[300px] md:h-[400px] rounded-2xl object-cover shadow-lg hover:scale-105 transition-transform duration-300"
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}
