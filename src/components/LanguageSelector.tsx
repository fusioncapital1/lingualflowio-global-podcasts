
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Globe, Plus } from 'lucide-react';

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLanguagesSelected: (languages: string[]) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isOpen, onClose, onLanguagesSelected }) => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [currentSelection, setCurrentSelection] = useState<string>('');

  const availableLanguages = [
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'zh', name: 'Chinese (Mandarin)', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
    { code: 'da', name: 'Danish', flag: '🇩🇰' },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    { code: 'th', name: 'Thai', flag: '🇹🇭' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' }
  ];

  if (!isOpen) return null;

  const handleAddLanguage = () => {
    if (currentSelection && !selectedLanguages.includes(currentSelection)) {
      setSelectedLanguages([...selectedLanguages, currentSelection]);
      setCurrentSelection('');
    }
  };

  const handleRemoveLanguage = (languageCode: string) => {
    setSelectedLanguages(selectedLanguages.filter(lang => lang !== languageCode));
  };

  const handleConfirm = () => {
    onLanguagesSelected(selectedLanguages);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Select Target Languages
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">Choose which languages to translate your podcast into</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="flex space-x-2">
            <Select value={currentSelection} onValueChange={setCurrentSelection}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose a language..." />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages
                  .filter(lang => !selectedLanguages.includes(lang.code))
                  .map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      <span className="flex items-center">
                        <span className="mr-2">{language.flag}</span>
                        {language.name}
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddLanguage} disabled={!currentSelection}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected Languages */}
          {selectedLanguages.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Selected Languages ({selectedLanguages.length})</h4>
              <div className="flex flex-wrap gap-2">
                {selectedLanguages.map((langCode) => {
                  const language = availableLanguages.find(l => l.code === langCode);
                  return (
                    <Badge key={langCode} variant="secondary" className="flex items-center space-x-1">
                      <span>{language?.flag}</span>
                      <span>{language?.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => handleRemoveLanguage(langCode)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Popular Combinations */}
          <div>
            <h4 className="font-medium mb-3">Popular Combinations</h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedLanguages(['es', 'fr', 'de'])}
                className="text-sm"
              >
                European Pack (Spanish, French, German)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedLanguages(['es', 'pt', 'fr'])}
                className="text-sm"
              >
                Romance Languages (Spanish, Portuguese, French)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedLanguages(['zh', 'ja', 'ko'])}
                className="text-sm"
              >
                East Asian Pack (Chinese, Japanese, Korean)
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={selectedLanguages.length === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Confirm Selection ({selectedLanguages.length})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSelector;
