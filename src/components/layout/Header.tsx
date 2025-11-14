import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Shield, Building, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { isCompanyUser } from '@/lib/auth-utils';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // Check admin status and company status
      if (session?.user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);
        setIsAdmin(roles?.some(r => r.role === 'admin') || false);

        // Check if user is a company user
        const isCompanyUserResult = await isCompanyUser(session.user.id);
        setIsCompany(isCompanyUserResult);
      } else {
        setIsAdmin(false);
        setIsCompany(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      // Use setTimeout to prevent potential deadlock when calling Supabase inside auth callback
      if (session?.user) {
        setTimeout(async () => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id);
          setIsAdmin(roles?.some(r => r.role === 'admin') || false);

          // Check if user is a company user
          const isCompanyUserResult = await isCompanyUser(session.user.id);
          setIsCompany(isCompanyUserResult);
        }, 0);
      } else {
        setIsAdmin(false);
        setIsCompany(false);
      }
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleProfileClick = () => {
    if (isCompany) {
      navigate('/company-dashboard');
    } else {
      navigate('/profile');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const publicNavItems = [
    //{ name: 'Homepage', path: '/' },
    { name: 'Professionals', path: '/professionals' },
    { name: 'Framework', path: '/framework' },
  ];

  const authNavItems = user ? [
    ...publicNavItems,
  ] : [
    ...publicNavItems,
    { name: 'Login', path: '/login' },
    { name: 'Sign Up', path: '/signup' },
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-foreground">Spective</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {authNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive(item.path)
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-muted-foreground'
                  }`}
              >
                {item.name}
              </Link>
            ))}
            {user && (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-border">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm">Admin</span>
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleProfileClick}
                  className="flex items-center space-x-2"
                >
                  {isCompany ? (
                    <Building2 className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="text-sm">{user.user_metadata?.full_name || user.email}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Sign Out</span>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-3">
              {authNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium px-2 py-1 rounded transition-colors ${isActive(item.path)
                      ? 'text-primary bg-muted'
                      : 'text-muted-foreground hover:text-primary hover:bg-muted'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <div className="pt-3 border-t border-border space-y-3">
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-muted transition-colors">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">Admin</span>
                      </div>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleProfileClick();
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start px-2 py-1 h-auto"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">{user.user_metadata?.full_name || user.email}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="w-full justify-start px-2 py-1 h-auto"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};