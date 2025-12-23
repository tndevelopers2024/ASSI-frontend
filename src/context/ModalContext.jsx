import React, { createContext, useContext, useState } from "react";
import UploadCaseModal from "../components/UploadCaseModal";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    const openUploadModal = (post = null) => {
        setEditingPost(post);
        setIsUploadModalOpen(true);
    };

    const closeUploadModal = () => {
        setIsUploadModalOpen(false);
        setEditingPost(null);
    };

    return (
        <ModalContext.Provider value={{ openUploadModal, closeUploadModal }}>
            {children}
            <UploadCaseModal
                open={isUploadModalOpen}
                onClose={closeUploadModal}
                initialData={editingPost}
            />
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
};
