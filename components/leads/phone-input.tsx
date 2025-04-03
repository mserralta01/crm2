"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// List of countries excluding OFAC sanctioned countries
const countries = [
  // Put United States and Canada at the top
  { name: 'United States', code: '1', flag: '🇺🇸' },
  { name: 'Canada', code: '1', flag: '🇨🇦' },
  // Other countries alphabetically
  { name: 'Australia', code: '61', flag: '🇦🇺' },
  { name: 'Austria', code: '43', flag: '🇦🇹' },
  { name: 'Belgium', code: '32', flag: '🇧🇪' },
  { name: 'Brazil', code: '55', flag: '🇧🇷' },
  { name: 'China', code: '86', flag: '🇨🇳' },
  { name: 'Denmark', code: '45', flag: '🇩🇰' },
  { name: 'Finland', code: '358', flag: '🇫🇮' },
  { name: 'France', code: '33', flag: '🇫🇷' },
  { name: 'Germany', code: '49', flag: '🇩🇪' },
  { name: 'Greece', code: '30', flag: '🇬🇷' },
  { name: 'India', code: '91', flag: '🇮🇳' },
  { name: 'Indonesia', code: '62', flag: '🇮🇩' },
  { name: 'Ireland', code: '353', flag: '🇮🇪' },
  { name: 'Israel', code: '972', flag: '🇮🇱' },
  { name: 'Italy', code: '39', flag: '🇮🇹' },
  { name: 'Japan', code: '81', flag: '🇯🇵' },
  { name: 'Mexico', code: '52', flag: '🇲🇽' },
  { name: 'Netherlands', code: '31', flag: '🇳🇱' },
  { name: 'New Zealand', code: '64', flag: '🇳🇿' },
  { name: 'Norway', code: '47', flag: '🇳🇴' },
  { name: 'Poland', code: '48', flag: '🇵🇱' },
  { name: 'Portugal', code: '351', flag: '🇵🇹' },
  { name: 'Saudi Arabia', code: '966', flag: '🇸🇦' },
  { name: 'Singapore', code: '65', flag: '🇸🇬' },
  { name: 'South Africa', code: '27', flag: '🇿🇦' },
  { name: 'South Korea', code: '82', flag: '🇰🇷' },
  { name: 'Spain', code: '34', flag: '🇪🇸' },
  { name: 'Sweden', code: '46', flag: '🇸🇪' },
  { name: 'Switzerland', code: '41', flag: '🇨🇭' },
  { name: 'Thailand', code: '66', flag: '🇹🇭' },
  { name: 'Turkey', code: '90', flag: '🇹🇷' },
  { name: 'United Arab Emirates', code: '971', flag: '🇦🇪' },
  { name: 'United Kingdom', code: '44', flag: '🇬🇧' },
];

// List of US states
const usStates = [
  { name: 'Alabama', code: 'AL' },
  { name: 'Alaska', code: 'AK' },
  { name: 'Arizona', code: 'AZ' },
  { name: 'Arkansas', code: 'AR' },
  { name: 'California', code: 'CA' },
  { name: 'Colorado', code: 'CO' },
  { name: 'Connecticut', code: 'CT' },
  { name: 'Delaware', code: 'DE' },
  { name: 'Florida', code: 'FL' },
  { name: 'Georgia', code: 'GA' },
  { name: 'Hawaii', code: 'HI' },
  { name: 'Idaho', code: 'ID' },
  { name: 'Illinois', code: 'IL' },
  { name: 'Indiana', code: 'IN' },
  { name: 'Iowa', code: 'IA' },
  { name: 'Kansas', code: 'KS' },
  { name: 'Kentucky', code: 'KY' },
  { name: 'Louisiana', code: 'LA' },
  { name: 'Maine', code: 'ME' },
  { name: 'Maryland', code: 'MD' },
  { name: 'Massachusetts', code: 'MA' },
  { name: 'Michigan', code: 'MI' },
  { name: 'Minnesota', code: 'MN' },
  { name: 'Mississippi', code: 'MS' },
  { name: 'Missouri', code: 'MO' },
  { name: 'Montana', code: 'MT' },
  { name: 'Nebraska', code: 'NE' },
  { name: 'Nevada', code: 'NV' },
  { name: 'New Hampshire', code: 'NH' },
  { name: 'New Jersey', code: 'NJ' },
  { name: 'New Mexico', code: 'NM' },
  { name: 'New York', code: 'NY' },
  { name: 'North Carolina', code: 'NC' },
  { name: 'North Dakota', code: 'ND' },
  { name: 'Ohio', code: 'OH' },
  { name: 'Oklahoma', code: 'OK' },
  { name: 'Oregon', code: 'OR' },
  { name: 'Pennsylvania', code: 'PA' },
  { name: 'Rhode Island', code: 'RI' },
  { name: 'South Carolina', code: 'SC' },
  { name: 'South Dakota', code: 'SD' },
  { name: 'Tennessee', code: 'TN' },
  { name: 'Texas', code: 'TX' },
  { name: 'Utah', code: 'UT' },
  { name: 'Vermont', code: 'VT' },
  { name: 'Virginia', code: 'VA' },
  { name: 'Washington', code: 'WA' },
  { name: 'West Virginia', code: 'WV' },
  { name: 'Wisconsin', code: 'WI' },
  { name: 'Wyoming', code: 'WY' },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  countrySelectorLabel?: string;
}

export function PhoneInput({
  value,
  onChange,
  label = "Phone",
  placeholder = "Enter phone number",
  countrySelectorLabel = "Country"
}: PhoneInputProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to US
  const [open, setOpen] = useState(false);

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      // If this is a US/Canada number (starts with +1)
      if (value.startsWith('+1')) {
        setSelectedCountry(countries[0]); // United States
        // Extract the number part without the country code
        const numberPart = value.substring(2).trim().replace(/\D/g, '');
        setPhoneNumber(formatUSPhoneNumber(numberPart));
      } else {
        // Try to determine country code from value
        const valueDigits = value.replace(/\D/g, '');
        for (const country of countries) {
          if (valueDigits.startsWith(country.code)) {
            setSelectedCountry(country);
            setPhoneNumber(valueDigits.substring(country.code.length));
            break;
          }
        }
      }
    }
  }, []);

  // Format the phone number for US/Canada format
  const formatUSPhoneNumber = (input: string) => {
    const digitsOnly = input.replace(/\D/g, '');
    
    if (digitsOnly.length <= 3) {
      return digitsOnly;
    } else if (digitsOnly.length <= 6) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
    } else {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
    }
  };

  // Handle phone number input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    
    // Format for US/Canada
    if (selectedCountry.code === '1') {
      setPhoneNumber(formatUSPhoneNumber(input));
    } else {
      setPhoneNumber(input);
    }
  };

  // Save the complete phone number with country code
  const savePhoneNumber = () => {
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    // For E.164 format (+[country code][number])
    if (formattedPhone) {
      formattedPhone = `+${selectedCountry.code}${formattedPhone}`;
      onChange(formattedPhone);
    } else {
      onChange('');
    }
  };

  // Handle country selection
  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    setOpen(false);
    
    // Reformat the phone number if switching to/from US/Canada
    if (country.code === '1') {
      setPhoneNumber(formatUSPhoneNumber(phoneNumber.replace(/\D/g, '')));
    }
    
    // Update the saved value with the new country code
    setTimeout(savePhoneNumber, 0);
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex w-full space-x-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-9 px-2 flex-shrink-0 w-fit"
              aria-label={countrySelectorLabel}
            >
              <span className="mr-1 text-base">{selectedCountry.flag}</span>
              <span className="text-xs">+{selectedCountry.code}</span>
              <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[220px]" align="start">
            <Command>
              <CommandInput placeholder="Search country..." className="h-9" />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem
                      key={country.name}
                      value={country.name}
                      onSelect={() => handleCountrySelect(country)}
                      className="text-sm"
                    >
                      <span className="mr-2 text-base">{country.flag}</span>
                      <span>{country.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        +{country.code}
                      </span>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4",
                          selectedCountry.name === country.name
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Input
          value={phoneNumber}
          onChange={handlePhoneChange}
          onBlur={savePhoneNumber}
          placeholder={placeholder}
          className="flex-1"
          type="tel"
        />
      </div>
    </div>
  );
}

export function CountryStateInput({
  countryValue,
  stateValue,
  onCountryChange,
  onStateChange,
  countryLabel = "Country",
  stateLabel = "State"
}: {
  countryValue: string;
  stateValue: string;
  onCountryChange: (value: string) => void;
  onStateChange: (value: string) => void;
  countryLabel?: string;
  stateLabel?: string;
}) {
  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [isUSA, setIsUSA] = useState(countryValue === 'United States' || countryValue === 'USA' || !countryValue);

  // Set the default country to USA if not already set
  useEffect(() => {
    if (!countryValue) {
      onCountryChange('United States');
      setIsUSA(true);
    }
  }, [countryValue, onCountryChange]);

  const handleCountrySelect = (countryName: string) => {
    onCountryChange(countryName);
    setCountryOpen(false);
    
    // Show state dropdown only for USA
    const isUS = countryName === 'United States';
    setIsUSA(isUS);
    
    // Clear state if not US
    if (!isUS) {
      onStateChange('');
    }
  };

  const handleStateSelect = (stateName: string) => {
    onStateChange(stateName);
    setStateOpen(false);
  };

  // Get just the country names
  const countryNames = countries.map(country => country.name);
  
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-2">
        <Label>{countryLabel}</Label>
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={countryOpen}
              className="w-full justify-between"
            >
              {countryValue || "Select country"}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[200px]">
            <Command>
              <CommandInput placeholder="Search country..." className="h-9" />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countryNames.map((country) => (
                    <CommandItem
                      key={country}
                      value={country}
                      onSelect={() => handleCountrySelect(country)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          countryValue === country ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {country}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      {isUSA && (
        <div className="space-y-2">
          <Label>{stateLabel}</Label>
          <Popover open={stateOpen} onOpenChange={setStateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={stateOpen}
                className="w-full justify-between"
              >
                {stateValue || "Select state"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[200px]">
              <Command>
                <CommandInput placeholder="Search state..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No state found.</CommandEmpty>
                  <CommandGroup>
                    {usStates.map((state) => (
                      <CommandItem
                        key={state.code}
                        value={state.name}
                        onSelect={() => handleStateSelect(state.name)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            stateValue === state.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {state.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
} 