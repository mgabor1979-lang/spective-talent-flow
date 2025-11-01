import { Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface ProfilePictureBadgesProps {
  readonly hasImage: boolean;
  readonly onUpload: () => void;
  readonly onDelete: () => void;
  readonly disabled?: boolean;
}

export function ProfilePictureBadges({ 
  hasImage, 
  onUpload, 
  onDelete,
  disabled = false 
}: ProfilePictureBadgesProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    onDelete();
  };

  return (
    <>
      <div className="absolute flex" style={{
        justifyContent:'space-between',
        alignItems:'center',
        flexDirection: 'row',
        width: '100%',
        bottom: '-10px',
      }}>
        <Button
          size="sm"
          variant="secondary"
          className="h-8 w-8 rounded-full p-0 shadow-lg"
          onClick={onUpload}
          disabled={disabled}
          title="Upload profile picture"
        >
          <Upload className="h-4 w-4" />
        </Button>
        
        {hasImage && (
          <Button
            size="sm"
            variant="destructive"
            className="h-8 w-8 rounded-full p-0 shadow-lg"
            onClick={handleDeleteClick}
            disabled={disabled}
            title="Remove profile picture"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove profile picture?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your profile picture? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
