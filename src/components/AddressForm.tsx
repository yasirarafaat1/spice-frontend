import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import type { State } from 'state-country';
import { getLocationFromPinCode } from '../utils/geonamesApi';
// Import libphonenumber-js functions
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

interface Address {
    id?: number;
    FullName: string;
    phone1: string;
    phone2: string | null;
    country: string;
    state: string;
    city: string;
    pinCode: string;
    address: string;
    addressType: string;
}

interface AddressFormProps {
    address?: Address;
    onSubmit: (address: Address) => void;
    onCancel: () => void;
}

export default function AddressForm({ address, onSubmit, onCancel }: AddressFormProps) {
    const { user } = useAuth();

    const [formData, setFormData] = useState<Address>({
        FullName: address?.FullName || '',
        phone1: address?.phone1 || '',
        phone2: address?.phone2 || '',
        country: address?.country || '',
        state: address?.state || '',
        city: address?.city || '',
        pinCode: address?.pinCode || '',
        address: address?.address || '',
        addressType: address?.addressType || 'home',
    });

    // State for available states based on selected country
    const [availableStates, setAvailableStates] = useState<string[]>([]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    // Load states when country changes
    useEffect(() => {
        if (formData.country) {
            try {
                // Dynamically import state-country to avoid require() error
                import('state-country').then((module) => {
                    const stateCountry = module.default;
                    const states = stateCountry.getAllStatesInCountry(formData.country);
                    setAvailableStates(states.map((state: State) => state.name));

                    // Reset state if it's not in the available states
                    if (formData.state && !states.some((s: State) => s.name === formData.state)) {
                        setFormData(prev => ({ ...prev, state: '' }));
                    }
                }).catch((error) => {
                    console.error('Error loading states:', error);
                    setAvailableStates([]);
                });
            } catch (error) {
                console.error('Error loading states:', error);
                setAvailableStates([]);
            }
        } else {
            setAvailableStates([]);
        }
    }, [formData.country]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Auto-detect country from phone number
        if (name === 'phone1' || name === 'phone2') {
            detectCountryFromPhoneNumber(name, value);
        }

        // Auto-fetch location data when PIN code is entered
        if (name === 'pinCode' && value.length >= 3) {
            handlePinCodeChange(value);
        }
    };

    const detectCountryFromPhoneNumber = (fieldName: string, phoneNumber: string) => {
        // Process phone numbers both with and without + prefix
        if (phoneNumber.length >= 10) {
            try {
                let phoneNumberToParse = phoneNumber;

                // If the phone number doesn't start with +, assume it's an Indian number and prepend +91
                if (!phoneNumber.startsWith('+')) {
                    // Assume India as default country (you can modify this logic as needed)
                    phoneNumberToParse = `+91${phoneNumber}`;
                }

                // Parse the phone number to get country information
                const parsedNumber = parsePhoneNumber(phoneNumberToParse);
                if (parsedNumber) {
                    // Update the phone field with the formatted number
                    setFormData(prev => ({ ...prev, [fieldName]: parsedNumber.formatInternational() }));

                }
            } catch {
                // If parsing fails, silently continue without updating country
                // Debug info removed for production
            }
        }
    };

    // Define a type for the debounce timer
    type WindowWithTimer = Window & typeof globalThis & { pinCodeDebounceTimer?: NodeJS.Timeout };

    const handlePinCodeChange = async (pinCode: string) => {
        // Debounce the API call - only fetch when user stops typing for 500ms
        const win = window as WindowWithTimer;
        if (win.pinCodeDebounceTimer) {
            clearTimeout(win.pinCodeDebounceTimer);
        }
        win.pinCodeDebounceTimer = setTimeout(async () => {
            if (pinCode.length >= 3 && pinCode.length <= 20) {
                setIsFetchingLocation(true);
                try {
                    const locationData = await getLocationFromPinCode(pinCode);
                    if (locationData) {
                        setFormData(prev => ({
                            ...prev,
                            country: locationData.country || prev.country,
                            state: locationData.state || prev.state,
                            city: locationData.city || prev.city
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching location data:', error);
                    // Optionally, show an error message to the user
                    setErrors(prev => ({
                        ...prev,
                        pinCode: 'Unable to fetch location data. Please enter manually.'
                    }));
                } finally {
                    setIsFetchingLocation(false);
                }
            }
        }, 500);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.FullName.trim()) {
            newErrors.FullName = 'Full name is required';
        }

        if (!formData.phone1.trim()) {
            newErrors.phone1 = 'Phone number is required';
        } else if (!isValidPhoneNumber(formData.phone1)) {
            newErrors.phone1 = 'Please enter a valid phone number with country code (e.g., +1234567890)';
        }

        if (formData.phone2 && formData.phone2.trim() && !isValidPhoneNumber(formData.phone2)) {
            newErrors.phone2 = 'Please enter a valid alternative phone number with country code (e.g., +1234567890)';
        }

        if (!formData.country.trim()) {
            newErrors.country = 'Country is required';
        }

        if (!formData.state.trim()) {
            newErrors.state = 'State is required';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        }

        if (!formData.pinCode.trim()) {
            newErrors.pinCode = 'PIN code is required';
        } else if (!/^\d{3,20}$/.test(formData.pinCode)) {
            newErrors.pinCode = 'Enter a valid PIN code';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        } else if (formData.address.length < 10) {
            newErrors.address = 'Address must be at least 10 characters';
        }

        if (!formData.addressType) {
            newErrors.addressType = 'Please select an address type';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        // More explicit check for user authentication
        // Allow users with email but no ID (temporary fix for authentication issue)
        if (!user || (!user.id && !user.email) || (user.id === '' && !user.email)) {
            setErrors({ form: 'User not authenticated. Please log out and log back in.' });
            return;
        }

        const userId = user?.id;

        setIsSubmitting(true);

        try {
            if (address?.id) {
                // Update existing address
                // For update, backend expects phone1 and phone2
                const updateData = {
                    ...formData,
                    phone1: formData.phone1,
                    phone2: formData.phone2,
                    address_id: address.id
                };
                await userAPI.updateAddress(address.id, updateData);
            } else {
                // Create new address
                // For create, backend expects phoneNo and alt_Phone

                // Use user ID if available, otherwise try to get from localStorage or use a fallback
                let finalUserId = userId;
                if (!finalUserId || finalUserId === '') {
                    // Try to get user from localStorage as fallback
                    try {
                        const savedUser = localStorage.getItem('user');
                        if (savedUser) {
                            const parsedUser = JSON.parse(savedUser);
                            finalUserId = parsedUser.id;
                        }
                    } catch {
                        // Error parsing user from localStorage
                    }
                }

                // No explicit error check here - let the API handle missing user IDs

                const createData = {
                    ...formData,
                    phoneNo: formData.phone1,
                    alt_Phone: formData.phone2,
                    decode_user: finalUserId,
                };
                await userAPI.createAddress(createData);
            }

            onSubmit(formData);
        } catch (error: unknown) {
            console.error('Error saving address:', error);

            // Show a more specific error message based on the error type
            let errorMessage = 'Failed to save address. Please try again.';

            if (error instanceof Error) {
                // Check if it's the specific user ID error we're fixing
                if (error.message.includes('Unable to retrieve user ID')) {
                    errorMessage = error.message;
                } else if (error.message.includes('Authentication')) {
                    errorMessage = 'Authentication error. Please log out and log back in.';
                }
            }

            setErrors(prev => ({ ...prev, form: errorMessage }));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Remove unused loading state since it's not being used
    // const [loading, setLoading] = useState(false);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {address?.id ? 'Edit Address' : 'Add New Address'}
                </h2>
                <button
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
                    type="button"
                >
                    <X size={24} />
                </button>
            </div>

            {errors.form && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{errors.form}</p>
                </div>
            )}

            {/* Changed from <form> to <div> to prevent nested form issue */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="FullName"
                            value={formData.FullName}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors ${errors.FullName ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="Enter full name"
                        />
                        {errors.FullName && <p className="mt-1 text-sm text-red-600">{errors.FullName}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            name="phone1"
                            value={formData.phone1}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors ${errors.phone1 ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="Enter phone number"
                        />
                        {errors.phone1 && <p className="mt-1 text-sm text-red-600">{errors.phone1}</p>}
                        <p className="mt-1 text-xs text-gray-500">Enter with country code. We'll auto-detect your country.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alternative Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone2"
                            value={formData.phone2 || ''}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors ${errors.phone2 ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="Enter alternative phone number (optional)"
                        />
                        {errors.phone2 && <p className="mt-1 text-sm text-red-600">{errors.phone2}</p>}
                        <p className="mt-1 text-xs text-gray-500">Optional, with country code</p>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={3}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors ${errors.address ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="Enter complete address"
                        />
                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors ${errors.city ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="Enter city"
                        />
                        {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            State *
                        </label>
                        <select
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors ${errors.state ? 'border-red-300' : 'border-gray-300'}`}
                            disabled={availableStates.length === 0}
                        >
                            <option value="">Select State</option>
                            {availableStates.map((state) => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                        {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country *
                        </label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors ${errors.country ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="Enter country"
                        />
                        {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            PIN Code *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="pinCode"
                                value={formData.pinCode}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors ${errors.pinCode ? 'border-red-300' : 'border-gray-300'}`}
                                placeholder="Enter PIN code"
                            />
                            {isFetchingLocation && (
                                <div className="absolute right-3 top-2.5">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600"></div>
                                </div>
                            )}
                        </div>
                        {errors.pinCode && <p className="mt-1 text-sm text-red-600">{errors.pinCode}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address Type *
                        </label>
                        <div className="flex space-x-6">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="addressType"
                                    value="home"
                                    checked={formData.addressType === 'home'}
                                    onChange={handleChange}
                                    className="text-amber-600 focus:ring-amber-500"
                                />
                                <span className="ml-2 text-gray-700">Home</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="addressType"
                                    value="work"
                                    checked={formData.addressType === 'work'}
                                    onChange={handleChange}
                                    className="text-amber-600 focus:ring-amber-500"
                                />
                                <span className="ml-2 text-gray-700">Work</span>
                            </label>
                        </div>
                        {errors.addressType && <p className="mt-1 text-sm text-red-600">{errors.addressType}</p>}
                    </div>
                </div>


                <div className="flex justify-end gap-4 pt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : (
                            'Save Address'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}