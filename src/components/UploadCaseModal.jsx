import { X, UploadCloud } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { createPost, updatePost } from "../api/postApi";

export default function UploadCaseModal({ open, onClose, initialData = null }) {
  const [title, setTitle] = useState("");
  const [caseText, setCaseText] = useState("");
  const [category, setCategory] = useState("");
  const [newImages, setNewImages] = useState([]); 
  const [existingImages, setExistingImages] = useState([]); 
  const [dragIndex, setDragIndex] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  // ✅ COMBINED IMAGES (must be above any return)
  const combinedImages = useMemo(() => {
    return [
      ...existingImages.map((img) => ({
        src: img,
        type: "existing"
      })),
      ...newImages.map((file, index) => ({
        src: URL.createObjectURL(file),
        file,
        fileIndex: index,
        type: "new"
      }))
    ];
  }, [existingImages, newImages]);

  // INITIAL DATA LOAD
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setCaseText(initialData.content || "");
      setCategory(initialData.category || "");
      setExistingImages(initialData.images || []);
      setNewImages([]);
    } else {
      setTitle("");
      setCaseText("");
      setCategory("");
      setExistingImages([]);
      setNewImages([]);
    }
  }, [initialData, open]);

  // ❗ MUST COME AFTER HOOKS
  if (!open) return null;

  // IMAGE UPLOAD
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // SUBMIT
  const handleSubmit = async () => {
    try {
      const payload = {
        title,
        content: caseText,
        category,
      };

      if (initialData) {
        await updatePost(initialData._id, payload, newImages, existingImages);
      } else {
        await createPost(payload, newImages);
      }

      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to save post");
    }
  };

  // DRAG EVENTS
  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index) => {
    const updated = [...combinedImages];
    const [movedItem] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, movedItem);

    const newExisting = [];
    const newNew = [];

    updated.forEach((item) => {
      if (item.type === "existing") newExisting.push(item.src);
      else newNew.push(item.file);
    });

    setExistingImages(newExisting);
    setNewImages(newNew);

    setDragIndex(null);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white w-[750px] rounded-2xl shadow-xl overflow-hidden animate-scaleIn max-h-[90vh] overflow-y-auto hide-scrollbar">

        {/* HEADER */}
        <div className="flex justify-between items-center bg-[#D7E5FF] px-6 py-4 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-700">
            {initialData ? "Edit Case" : "Upload New Case"}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black cursor-pointer">
            <X size={22} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-8 py-6 ">
          {/* SECTION TITLE */}
          <p className="text-sm font-semibold text-[#1A3A7D] mb-2">Text</p>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title*"
              className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              rows={4}
              placeholder="Case*"
              className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              value={caseText}
              onChange={(e) => setCaseText(e.target.value)}
            />

            {/* DROPDOWN */}
            <select
              className="w-full border border-gray-300 p-3 rounded-xl bg-white text-gray-600 outline-none focus:ring-2 focus:ring-blue-300"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Tag</option>
              <option value="General">General</option>
              <option value="Education">Education</option>
              <option value="Coding">Coding</option>
              <option value="Design">Design</option>
              <option value="News">News</option>
              <option value="Technology">Technology</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* IMAGE UPLOAD */}
          <p className="text-sm font-semibold text-[#1A3A7D] mt-8 mb-2">
            Upload your image
          </p>

          <label className="w-full h-32 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-gray-50 transition mb-4">
            <UploadCloud size={32} className="text-gray-500 mb-2" />
            <p className="text-gray-500 text-sm">Drag and Drop or upload media</p>

            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

          {/* IMAGE PREVIEWS */}
          {(existingImages.length > 0 || newImages.length > 0) && (
            <div className="flex flex-wrap gap-3 mt-2">
              {combinedImages.map((item, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group cursor-move"
                >
                  <img
                    src={item.type === "existing" ? `${BASE_URL}/${item.src}` : item.src}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />

                  {/* REMOVE BUTTON */}
                  <button
                    onClick={() =>
                      item.type === "existing"
                        ? removeExistingImage(existingImages.indexOf(item.src))
                        : removeNewImage(item.fileIndex)
                    }
                    className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 mt-8 pr-1 pb-2">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded-full bg-[#0057FF] text-white hover:bg-blue-700 transition cursor-pointer"
            >
              {initialData ? "Update Post" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
