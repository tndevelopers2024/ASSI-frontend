import React from 'react';

/**
 * Automatically converts URLs within a string into clickable <a> tags.
 * @param {string} text - The text to be linkified.
 * @returns {Array} - An array of React elements (strings and <a> tags).
 */
export const renderTextWithLinks = (text) => {
    if (!text) return text;

    // Regex to match URLs (http, https, www)
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
        if (urlRegex.test(part)) {
            const href = part.startsWith('www.') ? `https://${part}` : part;
            return (
                <a
                    key={index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};
