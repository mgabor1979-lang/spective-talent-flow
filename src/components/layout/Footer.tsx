import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  homepage_hero_subtitle: string;
}

export const Footer = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    company_name: 'Spective Kft.',
    company_address: 'Székesfehérvár',
    company_email: 'info@spective.hu',
    company_phone: '+36 1 1234567',
    homepage_hero_subtitle: '',
  });

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('company_name, company_address, company_email, company_phone, homepage_hero_subtitle')
        .maybeSingle();

      if (error) {
        console.error('Error fetching site settings:', error);
        return;
      }

      if (data) {
        setSettings({
          company_name: data.company_name || 'Spective Kft.',
          company_address: data.company_address || 'Székesfehérvár',
          company_email: data.company_email || 'info@spective.hu',
          company_phone: data.company_phone || '+36 1 1234567',
          homepage_hero_subtitle: data.homepage_hero_subtitle || ''
        });
      } else {
        // No settings found, use defaults
        setSettings({
          company_name: 'Spective Kft.',
          company_address: 'Székesfehérvár',
          company_email: 'info@spective.hu',
          company_phone: '+36 1 1234567',
          homepage_hero_subtitle: ''
        });
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  return (
    <footer id="footer" className="bg-spective-dark text-primary-foreground py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start">
          {/* Contact Information - Left Aligned */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">{settings.company_name}</h3>
            
            <div className="space-y-3">
              {settings.company_address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-spective-accent" />
                  <span>{settings.company_address}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-spective-accent" />
                <a 
                  href={`mailto:${settings.company_email}`}
                  className="hover:text-spective-accent transition-colors"
                >
                  {settings.company_email}
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-spective-accent" />
                <a 
                  href={`tel:${settings.company_phone.replace(/\s/g, '')}`}
                  className="hover:text-spective-accent transition-colors"
                >
                  {settings.company_phone}
                </a>
              </div>
            </div>
          </div>

          {/* Company Slogan */}
          <div className="mt-8 md:mt-0 text-center md:text-right">
            <p className="text-lg italic text-muted-foreground">
              {settings.homepage_hero_subtitle}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {settings.company_name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};