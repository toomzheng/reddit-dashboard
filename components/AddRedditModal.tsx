import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus } from 'lucide-react';

interface AddRedditModalProps {
  onAdd: (subreddit: string) => void;
}

export function AddRedditModal({ onAdd }: AddRedditModalProps) {
  const [subreddit, setSubreddit] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subreddit) {
      // Remove 'r/' prefix if present and clean up the input
      const cleanSubreddit = subreddit.replace(/^r\//, '').trim();
      onAdd(cleanSubreddit);
      setSubreddit('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Subreddit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subreddit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Enter subreddit name or URL (e.g., 'sidehustle' or 'r/sidehustle')"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={!subreddit}>Add Subreddit</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 