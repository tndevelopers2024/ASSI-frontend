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
                    className="w-[300px] h-auto rounded-xl mt-3 cursor-pointer object-cover"
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
                        className="w-full h-full object-cover rounded-xl cursor-pointer"
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

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 z-10 shadow-lg cursor-pointer"
                >
                    <X size={24} />
                </button>

                {/* Image Slider */}
                <div className="relative bg-gray-900">
                    <img
                        src={images[currentIndex]}
                        className="w-full max-h-[600px] object-contain"
                        alt={`slide-${currentIndex}`}
                    />

                    {/* Navigation Arrows - Only show if more than 1 image */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-3 hover:bg-white shadow-lg cursor-pointer"
                            >
                                <ChevronLeft size={28} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-3 hover:bg-white shadow-lg cursor-pointer"
                            >
                                <ChevronRight size={28} />
                            </button>

                            {/* Image Counter */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                                {currentIndex + 1} / {images.length}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
