import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PortfolioDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export const PortfolioDetailModal = ({
  isOpen,
  onClose,
  title,
  description,
}: PortfolioDetailModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-2xl font-bold text-spective-dark">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="relative flex-1 overflow-hidden pb-6 pt-2">
          <div className="h-full overflow-y-auto px-6 py-4">
            <div 
              className="text-muted-foreground [&_p:empty]:min-h-[1.5em] [&_p:empty]:block [&_p]:my-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-3 [&_strong]:font-bold [&_em]:italic [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:ml-0" 
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
          <div 
            className="absolute top-0 left-0 right-0 h-8 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, hsl(var(--background)), transparent)'
            }}
          ></div>
          <div 
            className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, hsl(var(--background)), transparent)'
            }}
          ></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
