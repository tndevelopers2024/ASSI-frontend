import { X, UploadCloud } from "lucide-react";
import { useState } from "react";

export default function EditProfileImageModal({ open, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  if (!open) return null;

  const handleFileChange = (f) => {
    const picked = f[0];
    if (picked) {
      setFile(picked);
      setPreview(URL.createObjectURL(picked));
    }
  };

  const handleUpload = () => {
    if (file) onUpload(file);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn h-full">
      <div className="bg-white p-6 rounded-2xl w-[380px] shadow-xl relative animate-scaleIn">

        {/* Close Button */}
        <button
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition cursor-pointer"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold mb-5">Edit Profile Picture</h2>

        {/* Upload Box */}
        <label
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-500 transition"
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-28 h-28 object-cover rounded-full shadow-md"
            />
          ) : (
            <>
              <UploadCloud size={32} className="text-gray-500" />
              <span className="text-gray-600">Click to upload image</span>
            </>
          )}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
          />
        </label>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 cursor-pointer"
            disabled={!file}
          >
            Save
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
      `}</style>
    </div>
  );
}
