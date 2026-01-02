import API from "./api";

export const createPost = async (postData, images) => {
    const formData = new FormData();
    formData.append("title", postData.title);

    formData.append("content", postData.content);

    // Handle category as array or string
    if (Array.isArray(postData.category)) {
        postData.category.forEach(cat => formData.append("category", cat));
    } else {
        formData.append("category", postData.category);
    }

    images.forEach((img) => {
        formData.append("images", img); // must match multer field
    });

    const res = await API.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
};

export const getAllPosts = async () => {
    const res = await API.get("/posts");
    return res.data;
};

// Add a comment to a post
export const addComment = async (postId, formData) => {
    // Add postId inside formData
    formData.append("postId", postId);

    const res = await API.post(`/comments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
};

// Get all comments for a post
export const getComments = async (postId) => {
    const res = await API.get(`/comments/${postId}`);
    return res.data;
};

// Delete a comment

// Delete a comment
export const deleteComment = async (id) => {
    const res = await API.delete(`/comments/${id}`);
    return res.data;
};

// Delete a post
export const deletePost = async (id) => {
    const res = await API.delete(`/posts/${id}`);
    return res.data;
};

// Update a post
export const updatePost = async (id, postData, images, existingImages) => {
    const formData = new FormData();

    formData.append("title", postData.title);
    formData.append("content", postData.content);

    // Handle category as array or string
    if (Array.isArray(postData.category)) {
        postData.category.forEach(cat => formData.append("category", cat));
    } else {
        formData.append("category", postData.category);
    }

    // New images
    if (images && images.length > 0) {
        images.forEach((img) => {
            formData.append("images", img);
        });
    }

    // Important: send existing images as ONE JSON string
    formData.append("existingImages", JSON.stringify(existingImages || []));

    const res = await API.put(`/posts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
};


// Toggle save post
export const toggleSavePost = async (id) => {
    const res = await API.put(`/posts/save/${id}`);
    return res.data;
};

// Toggle like post
export const toggleLikePost = async (id) => {
    const res = await API.put(`/posts/like/${id}`);
    return res.data;
};

// Get saved posts
export const getSavedPosts = async () => {
    const res = await API.get("/posts/saved/all");
    return res.data;
};

// Get comments by user
export const getUserComments = async () => {
    const res = await API.get("/comments/user/all");
    return res.data;
};
