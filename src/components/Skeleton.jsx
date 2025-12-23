import React from "react";

const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export const PostSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-200">
        <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
            </div>
        </div>
        <div className="mt-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="mt-4 flex gap-3">
            <Skeleton className="h-10 flex-1 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
        </div>
    </div>
);

export const SidebarSkeleton = () => (
    <div className="grid grid-cols-[1fr_auto] gap-4 mb-3">
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-4 w-16" />
    </div>
);

export default Skeleton;
