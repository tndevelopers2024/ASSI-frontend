import { X, UploadCloud, ChevronDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { createPost, updatePost } from "../api/postApi";
import toast from "react-hot-toast";
import { compressImage } from "../utils/imageUtils";
import { getSocket } from "../utils/socket";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableImage } from "./SortableImage";
import TermsModal from "./TermsModal";


export default function UploadCaseModal({ open, onClose, initialData = null }) {
  const socket = getSocket();
  const [title, setTitle] = useState("");
  const [caseText, setCaseText] = useState("");
  const [category, setCategory] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    caseText: "",
    category: "",
  });
  const [showTerms, setShowTerms] = useState(false);



  const BASE_URL = import.meta.env.VITE_API_URL;

  // ✅ COMBINED IMAGES (must be above any return)
  const combinedImages = useMemo(() => {
    return [
      ...existingImages.map((img, idx) => ({
        id: `existing-${idx}-${img}`,
        src: img,
        type: "existing",
        originalIndex: idx
      })),
      ...newImages.map((file, index) => ({
        id: `new-${index}-${file.name}`,
        src: URL.createObjectURL(file),
        file,
        fileIndex: index,
        type: "new",
        originalIndex: index
      }))
    ];
  }, [existingImages, newImages]);

  // INITIAL DATA LOAD
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setCaseText(initialData.content || "");
      // Handle category coming as string or array
      const initialCats = initialData.category
        ? (Array.isArray(initialData.category) ? initialData.category : [initialData.category])
        : [];
      setCategory(initialCats);
      setExistingImages(initialData.images || []);
      setNewImages([]);
    } else {
      setTitle("");
      setCaseText("");
      setCategory([]);
      setExistingImages([]);
      setNewImages([]);
    }
  }, [initialData, open]);


  // IMAGE UPLOAD HANDLERS
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (fileList) => {
    const files = Array.from(fileList);

    if (combinedImages.length + files.length > 10) {
      toast.error("You can only upload up to 10 images.");
      return;
    }

    const compressionToast = files.length > 1 ? toast.loading("Compressing images...") : null;

    try {
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
      );

      setNewImages((prev) => [...prev, ...compressedFiles]);
      if (compressionToast) toast.success("Images ready!", { id: compressionToast });
    } catch (err) {
      console.error("Compression failed", err);
      setNewImages((prev) => [...prev, ...files]); // fallback to original
      if (compressionToast) toast.error("Some images failed to compress, using originals.", { id: compressionToast });
    }
  };

  const handleImageUpload = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (isPosting) return;

    const newErrors = {
      title: title ? "" : "Title is required",
      caseText: caseText ? "" : "Case description is required",
      category: category && category.length > 0 ? "" : "At least one tag is required",
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some((msg) => msg !== "")) return;

    setIsPosting(true);

    try {
      const payload = {
        title,
        content: caseText,
        category,
      };

      let response;

      if (initialData) {
        response = await updatePost(initialData._id, payload, newImages, existingImages);
        toast.success("Post updated!");
        socket.emit("post:updated", response);
      } else {
        response = await createPost(payload, newImages);
        toast.success("Post created!");
        socket.emit("post:new", response);
      }

      onClose();
      setIsPosting(false);

    } catch (err) {
      console.error(err);
      toast.error("Failed to upload post");
      setIsPosting(false);
    }
  };




  // DRAG END
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // 10px movement required to start dragging on desktop
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 1000, // 1 second long press for mobile
        tolerance: 5, // Allow 5px of movement during the hold
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ❗ MUST COME AFTER HOOKS
  if (!open) return null;

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = combinedImages.findIndex((item) => item.id === active.id);
      const newIndex = combinedImages.findIndex((item) => item.id === over.id);

      const updated = arrayMove(combinedImages, oldIndex, newIndex);

      const newExisting = [];
      const newNew = [];

      updated.forEach((item) => {
        if (item.type === "existing") newExisting.push(item.src);
        else newNew.push(item.file);
      });

      setExistingImages(newExisting);
      setNewImages(newNew);
    }
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

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Title*"
                className={`w-full border p-3 rounded-xl outline-none focus:ring-2 
      ${errors.title ? "border-red-500 ring-red-200" : "border-gray-300 focus:ring-blue-300"}
    `}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: "" }));
                }}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>


            <div>
              <textarea
                rows={4}
                placeholder="Description*"
                className={`w-full border p-3 rounded-xl outline-none resize-none focus:ring-2 
      ${errors.caseText ? "border-red-500 ring-red-200" : "border-gray-300 focus:ring-blue-300"}
    `}
                value={caseText}
                onChange={(e) => {
                  setCaseText(e.target.value);
                  setErrors((prev) => ({ ...prev, caseText: "" }));
                }}
              />
              {errors.caseText && <p className="text-red-500 text-sm mt-1">{errors.caseText}</p>}
            </div>


            {/* DROPDOWN */}
            <div className="relative">
              {/* Selected Box */}
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-full border p-3 rounded-xl bg-white cursor-pointer flex justify-between items-center
      ${errors.category ? "border-red-500" : "border-gray-300"}
    `}
              >
                <div className="flex flex-wrap gap-2">
                  {category && Array.isArray(category) && category.length > 0 ? (
                    category.map((tag) => (
                      <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                        {tag}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategory((prev) => prev.filter((t) => t !== tag));
                          }}
                          className="hover:text-blue-900 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">Select Tags *</span>
                  )}
                </div>
                <span className="text-gray-500"><ChevronDown size={22} /></span>
              </div>

              {/* Error message */}
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}

              {/* Dropdown List */}
              {dropdownOpen && (
                <div
                  className="absolute w-full mt-2 bg-white shadow-xl rounded-xl border border-gray-200 py-2 z-20 animate-fadeIn max-h-60 overflow-y-auto"
                >
                  <p className="px-4 py-2 text-sm font-semibold text-gray-700">
                    Tags
                  </p>

                  <div className="grid grid-cols-2 gap-2 px-4 pb-2">
                    {[
                      "Diagnostic Dilemma",
                      "Cranioverterbal",
                      "Cervical",
                      "Thoracic",
                      "Lumbar",
                      "Sacral",
                      "Degenerative",
                      "Trauma",
                      "Tumours",
                      "Metastasis",
                      "Infections",
                      "Tuberculosis",
                      "Adult deformity",
                      "Pediatric Deformity",
                      "Osteoporosis",
                      "Inflammatory",
                      "Metabolic",
                      "Complications",
                      "Minimally invasive surgery",
                      "Other",
                    ].map((item) => {
                      const isSelected = Array.isArray(category) && category.includes(item);
                      return (
                        <label
                          key={item}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setCategory((prev) => prev.filter((t) => t !== item));
                              } else {
                                setCategory((prev) => [...(Array.isArray(prev) ? prev : []), item]);
                                setErrors((prev) => ({ ...prev, category: "" }));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-sm text-gray-700">{item}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>


          </div>

          {/* IMAGE UPLOAD */}
          <p className="text-sm font-semibold text-[#1A3A7D] mt-8 mb-2">
            Upload your image
          </p>

          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full h-32 border-2 border-dashed flex flex-col items-center justify-center rounded-xl cursor-pointer transition mb-4
            ${isDragging ? "bg-blue-50 border-blue-500" : "border-gray-300 hover:bg-gray-50"}
            `}
          >
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={combinedImages.map(item => item.id)}
                strategy={rectSortingStrategy}
              >
                <div className="flex flex-wrap gap-3 mt-2">
                  {combinedImages.map((item, idx) => (
                    <SortableImage
                      key={item.id}
                      id={item.id}
                      src={item.type === "existing" ? `${BASE_URL}/${item.src}` : item.src}
                      onRemove={() =>
                        item.type === "existing"
                          ? removeExistingImage(existingImages.indexOf(item.src))
                          : removeNewImage(item.fileIndex)
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* TERMS AND CONDITIONS */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By posting, you agree to our{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-[#0057FF] hover:underline font-semibold cursor-pointer"
              >
                Terms and Conditions
              </button>
            </p>
          </div>

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
              disabled={isPosting}
              className={`px-6 py-2 rounded-full text-white transition cursor-pointer ${isPosting ? "bg-blue-400 cursor-not-allowed" : "bg-[#0057FF] hover:bg-blue-700"}`}
            >
              {isPosting ? "Posting..." : initialData ? "Update Post" : "Post"}
            </button>

          </div>
        </div>
      </div>

      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}

