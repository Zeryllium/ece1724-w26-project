"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function EditCourseForm({
    courseId,
    initialName,
    initialDescription,
    onCancel
}: {
    courseId: string,
    initialName: string,
    initialDescription: string,
    onCancel: () => void
}) {
    const [courseName, setCourseName] = useState(initialName);
    const [courseDescription, setCourseDescription] = useState(initialDescription);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/courses/${courseId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ courseName, courseDescription }),
            });
            if (!res.ok) {
                throw new Error("Failed to update course");
            }
            const updatedCourse = await res.json();
            console.log("Updated course:", updatedCourse);
            router.push(`/courses/${courseId}`);
            
            router.refresh();
            onCancel();
        } catch (err) {
            setError("Error updating course");
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="border p-6 rounded-lg shadow-sm space-y-4 max-w-xl">
            <h2 className="text-xl font-semibold">Edit Course</h2>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
                    Course Name
                </label>
                <input
                    type="text"
                    id="courseName"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                />
            </div>
            
            <div>
                <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Course Description
                </label>
                <textarea
                    id="courseDescription"
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                    Cancel
                </button>
            </div>
        </form>


    )
};
