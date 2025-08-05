import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import citiesService from '../../services/cities.service';

interface City {
  name: string;
  state: string;
  country: string;
  fullName: string;
}

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Digite uma cidade...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Função para buscar cidades usando o serviço
  const searchCities = async (query: string): Promise<City[]> => {
    if (query.length < 2) return [];

    try {
      return await citiesService.searchCities(query);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      return [];
    }
  };

  // Buscar cidades quando o input muda
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (inputValue.length >= 2) {
        setLoading(true);
        try {
          const cities = await searchCities(inputValue);
          setSuggestions(cities);
          setIsOpen(cities.length > 0);
        } catch (error) {
          console.error('Erro ao buscar cidades:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [inputValue]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleCitySelect = (city: City) => {
    setInputValue(city.fullName);
    onChange(city.fullName);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className={`input-field-with-icon ${className}`}
          placeholder={placeholder}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 animate-spin" />
        )}
      </div>

      {/* Dropdown de sugestões */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-gray-800 border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
        >
          {suggestions.map((city, index) => (
            <button
              key={`${city.name}-${city.state}-${index}`}
              type="button"
              onClick={() => handleCitySelect(city)}
              className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors duration-200 flex items-center gap-3 first:rounded-t-xl last:rounded-b-xl"
            >
              <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <div>
                <div className="text-purple-100 font-medium">{city.name}</div>
                <div className="text-purple-300 text-sm">{city.state}, {city.country}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
