import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageGrid({ images = [], postContent = "" }) {
    const [openImageIndex, setOpenImageIndex] = useState(null); // Track which image index is open

    if (!images.length) return null;

    const first = images[0];
    const rightImages = images.slice(1, 3);
    const extraCount = images.length - 3;

    const handleClick = (index) => setOpenImageIndex(index);
    const closePopup = () => setOpenImageIndex(null);

    // -------------------------
    // CASE: ONLY 1 IMAGE
    // -------------------------
    if (images.length === 1) {
        return (
            <>
                <div className="flex justify-center">
                    <img
                        src={images[0]}
                        alt="single"
                        onClick={() => handleClick(0)}
                        className="w-[400px] h-auto rounded-xl mt-3 cursor-pointer object-cover"
                    />
                </div>

                {/* POPUP */}
                {openImageIndex !== null && (
                    <Popup
                        images={images}
                        initialIndex={openImageIndex}
                        content={postContent}
                        onClose={closePopup}
                    />
                )}
            </>
        );
    }

    // -------------------------
    // CASE: 2 IMAGES (SIDE BY SIDE)
    // -------------------------
    if (images.length === 2) {
        return (
            <>
                <div className="grid grid-cols-2 gap-2 mt-3 rounded-xl">
                    {images.map((img, i) => (
                        <img
                            key={i}
                            src={img}
                            onClick={() => handleClick(i)}
                            className="w-full h-[400px] object-cover rounded-xl cursor-pointer"
                        />
                    ))}
                </div>

                {openImageIndex !== null && (
                    <Popup
                        images={images}
                        initialIndex={openImageIndex}
                        content={postContent}
                        onClose={closePopup}
                    />
                )}
            </>
        );
    }

    // -------------------------
    // DEFAULT (3+ IMAGES)
    // -------------------------
    return (
        <>
            <div className="grid grid-cols-3 gap-2 mt-3 rounded-xl  overflow-hidden">

                {/* BIG LEFT IMAGE */}
                <div className="col-span-2">
                    <img
                        src={first}
                        alt="first"
                        onClick={() => handleClick(0)}
                        className="w-full h-[410px] object-cover rounded-xl cursor-pointer"
                    />
                </div>

                {/* RIGHT 2 IMAGES */}
                <div className="grid grid-rows-2 gap-2 h-fit">

                    {rightImages.map((img, i) => (
                        <div key={i} className="relative h-[200px] cursor-pointer">
                            <img
                                src={img}
                                alt={`image-${i + 1}`}
                                onClick={() => handleClick(i + 1)}
                                className="w-full h-full object-cover rounded-xl"
                            />

                            {/* Overlay for +extraCount (Clickable) */}
                            {i === 1 && extraCount > 0 && (
                                <div
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl cursor-pointer"
                                    onClick={() => handleClick(i + 1)}   // <--- FIX: Click opens popup
                                >
                                    <span className="text-white font-semibold text-5xl">
                                        +{extraCount}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}


                </div>
            </div>

            {/* POPUP */}
            {openImageIndex !== null && (
                <Popup
                    images={images}
                    initialIndex={openImageIndex}
                    content={postContent}
                    onClose={closePopup}
                />
            )}
        </>
    );
}

// -------------------------
// POPUP COMPONENT WITH SLIDER
// -------------------------
function Popup({ images, initialIndex, content, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [touchStart, setTouchStart] = useState(null);

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e) => {
        if (!touchStart) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;

        // Minimum swipe distance of 50px
        if (diff > 50) {
            nextImage();
        } else if (diff < -50) {
            prevImage();
        }

        setTouchStart(null);
    };

    return (
        <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            {/* Main Wrapper */}
            <div
                className="relative max-w-4xl w-full flex flex-col items-center gap-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button - Positioned top-right relative to container */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 md:-right-4 text-white hover:text-gray-300 transition-colors cursor-pointer"
                >
                    <X size={32} />
                </button>

                {/* Image Container */}
                <div
                    className="relative bg-white rounded-2xl shadow-2xl overflow-visible w-full flex items-center justify-center bg-gray-950"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="w-full overflow-hidden rounded-2xl flex items-center justify-center min-h-[300px]">
                        <img
                            src={images[currentIndex]}
                            className="w-full max-h-[70vh] md:max-h-[600px] object-contain select-none"
                            alt={`slide-${currentIndex}`}
                            draggable="false"
                        />
                    </div>

                    {/* Navigation Arrows - Outside on Desktop */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="hidden md:flex absolute -left-20 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 shadow-xl cursor-pointer transition-all hover:scale-110 border border-white/20"
                            >
                                <ChevronLeft size={36} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="hidden md:flex absolute -right-20 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 shadow-xl cursor-pointer transition-all hover:scale-110 border border-white/20"
                            >
                                <ChevronRight size={36} />
                            </button>
                        </>
                    )}
                </div>

                {/* Pagination (Outside/Below the image) */}
                {images.length > 1 && (
                    <div className="bg-white/10 backdrop-blur-sm text-white px-5 py-2 rounded-full text-sm font-semibold border border-white/20 shadow-2xl">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>
        </div>
    );
}
