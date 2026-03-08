'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ItemType, MIME_TYPE_OPTIONS } from '@/lib/types';
import { api } from '@/lib/api';

interface AddItemModalProps {
  open: boolean;
  mode: ItemType;
  parentId: number | null;
  onClose: () => void;
  onCreated: () => void;
}

interface FormErrors {
  name?: string;
  mimeType?: string;
}

export function AddItemModal({ open, mode, parentId, onClose, onCreated }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    else if (name.trim().length > 255) newErrors.name = 'Name must be 255 characters or fewer';
    if (mode === 'document' && !mimeType) newErrors.mimeType = 'File type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError('');
    try {
      await api.createItem({
        name: name.trim(),
        type: mode,
        parentId: parentId ?? null,
        mimeType: mode === 'document' ? mimeType : undefined,
        size: mode === 'document' ? Math.floor(Math.random() * 10 * 1024 * 1024) : undefined,
        createdBy: 'John Green',
      });
      setName('');
      setMimeType('');
      setErrors({});
      onCreated();
      onClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to create item');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setName('');
    setMimeType('');
    setErrors({});
    setApiError('');
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'folder' ? 'Add New Folder' : 'Upload File'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={mode === 'folder' ? 'Folder name' : 'File name'}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {mode === 'document' && (
              <div className="space-y-1">
                <Label htmlFor="mimeType">File Type</Label>
                <Select value={mimeType} onValueChange={(value) => setMimeType(value ?? '')}>
                  <SelectTrigger id="mimeType">
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MIME_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.mimeType && (
                  <p className="text-sm text-red-500">{errors.mimeType}</p>
                )}
              </div>
            )}

            {apiError && (
              <p className="text-sm text-red-500">{apiError}</p>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : mode === 'folder' ? 'Create Folder' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
