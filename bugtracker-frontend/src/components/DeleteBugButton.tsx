import React from 'react';

interface DeleteBugButtonProps {
    bugId: number;
    onDelete: () => void;
}

const DeleteBugButton: React.FC<DeleteBugButtonProps> = ({ bugId, onDelete }) => {
    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:8081/api/bugs/${bugId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete bug');
            }

            onDelete();
        } catch (error) {
            console.error('Error deleting bug:', error);
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-900"
        >
            Delete
        </button>
    );
};

export default DeleteBugButton; 