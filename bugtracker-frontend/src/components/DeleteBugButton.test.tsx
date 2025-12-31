import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteBugButton from './DeleteBugButton';

describe('DeleteBugButton', () => {
    const mockOnDelete = jest.fn();
    const bugId = 1;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the delete button', () => {
        render(<DeleteBugButton bugId={bugId} onDelete={mockOnDelete} />);
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('should call onDelete when the delete button is clicked', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
        });

        render(<DeleteBugButton bugId={bugId} onDelete={mockOnDelete} />);
        await fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        expect(global.fetch).toHaveBeenCalledWith(`http://localhost:8081/api/bugs/${bugId}`, {
            method: 'DELETE',
        });
        expect(mockOnDelete).toHaveBeenCalled();
    });

    it('should log an error when the delete request fails', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: false,
        });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        render(<DeleteBugButton bugId={bugId} onDelete={mockOnDelete} />);
        await fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        expect(global.fetch).toHaveBeenCalledWith(`http://localhost:8081/api/bugs/${bugId}`, {
            method: 'DELETE',
        });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(mockOnDelete).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });
}); 