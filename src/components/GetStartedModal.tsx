import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GetStartedModal = ({ isOpen, onClose }: GetStartedModalProps) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUserProfile } = useUser();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({ name: name.trim() })
        .select()
        .single();

      if (error || !data) {
        throw error || new Error('Remote insert returned no data');
      }

      setUserProfile(data);
      toast({
        title: "Welcome!",
        description: `Great to have you here, ${name}!`,
      });
      onClose();
      navigate('/dashboard');
    } catch (error) {
      console.warn('Supabase profile creation skipped, using local profile:', error);
      // Fallback: create local profile
      const localProfile = {
        id: 'local-' + Date.now(),
        name: name.trim(),
        created_at: new Date().toISOString(),
      };
      setUserProfile(localProfile);
      toast({
        title: "Welcome!",
        description: `Great to have you here, ${name}!`,
      });
      onClose();
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="glass-card p-8 w-full max-w-md pointer-events-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4"
                >
                 <img
  src="/favicon.ico"
  alt="Kaushlya"
  className="w-10 h-10 rounded-full object-cover"
/>
                </motion.div>
                <h2 className="text-2xl font-bold text-primary mb-2">Welcome to Career Navigator</h2>
                <p className="text-muted-foreground">Let's personalize your experience</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    What should we call you?
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                  ) : (
                    <>
                      Start Your Journey
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GetStartedModal;
