import axios from 'axios';

// Define the structure of the GeoNames API response
interface GeoNamesPostalCode {
    adminName1: string;    // State
    adminName2: string;    // District/City
    countryCode: string;   // Country Code
    placeName: string;     // Area
    lat: string;
    lng: string;
}

interface GeoNamesResponse {
    postalCodes: GeoNamesPostalCode[];
}

// Mapping of country codes to country names
const countryCodeToNameMap: Record<string, string> = {
    'IN': 'India',
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'JP': 'Japan',
    'CN': 'China',
    'BR': 'Brazil',
    'RU': 'Russia',
    'IT': 'Italy',
    'ES': 'Spain',
    'MX': 'Mexico',
    'KR': 'South Korea',
    'ID': 'Indonesia',
    'TR': 'Turkey',
    'SA': 'Saudi Arabia',
    'ZA': 'South Africa',
    'AR': 'Argentina',
    'PK': 'Pakistan',
    'BD': 'Bangladesh',
    'NG': 'Nigeria',
    'EG': 'Egypt',
    'VN': 'Vietnam',
    'PH': 'Philippines',
    'TH': 'Thailand',
    'MY': 'Malaysia',
    'SG': 'Singapore',
    'NZ': 'New Zealand',
    'CH': 'Switzerland',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'AT': 'Austria',
    'PL': 'Poland',
    'CZ': 'Czech Republic',
    'HU': 'Hungary',
    'PT': 'Portugal',
    'GR': 'Greece',
    'IL': 'Israel',
    'AE': 'United Arab Emirates',
    'KW': 'Kuwait',
    'QA': 'Qatar',
    'OM': 'Oman',
    'LK': 'Sri Lanka',
    'NP': 'Nepal',
    'MM': 'Myanmar',
    'KH': 'Cambodia',
    'LA': 'Laos',
    'BN': 'Brunei',
    'BT': 'Bhutan',
    'MV': 'Maldives',
    'AF': 'Afghanistan',
    'JO': 'Jordan',
    'LB': 'Lebanon',
    'IQ': 'Iraq',
    'IR': 'Iran',
    'SY': 'Syria',
    'YE': 'Yemen',
    'TN': 'Tunisia',
    'MA': 'Morocco',
    'DZ': 'Algeria',
    'KE': 'Kenya',
    'UG': 'Uganda',
    'TZ': 'Tanzania',
    'ZW': 'Zimbabwe',
    'ZM': 'Zambia',
    'MW': 'Malawi',
    'MZ': 'Mozambique',
    'BW': 'Botswana',
    'NA': 'Namibia',
    'GH': 'Ghana',
    'CI': 'Ivory Coast',
    'SN': 'Senegal',
    'ML': 'Mali',
    'BF': 'Burkina Faso',
    'BJ': 'Benin',
    'TG': 'Togo',
    'CM': 'Cameroon',
    'CG': 'Republic of the Congo',
    'CD': 'Democratic Republic of the Congo',
    'AO': 'Angola',
    'ET': 'Ethiopia',
    'ER': 'Eritrea',
    'DJ': 'Djibouti',
    'SO': 'Somalia',
    'SD': 'Sudan',
    'SS': 'South Sudan',
    'CF': 'Central African Republic',
    'TD': 'Chad',
    'LY': 'Libya',
    'KM': 'Comoros',
    'SC': 'Seychelles',
    'MU': 'Mauritius',
    'MG': 'Madagascar',
    'RE': 'Réunion',
    'YT': 'Mayotte',
    'TF': 'French Southern Territories'
};

/**
 * Fetches location data (country, state, city) from a pin code using GeoNames API
 * @param pinCode The postal code to look up
 * @returns Promise containing location data or null if not found
 */
export const getLocationFromPinCode = async (pinCode: string): Promise<{
    country: string;
    state: string;
    city: string;
} | null> => {
    try {
        // Make sure we have a valid pin code
        if (!pinCode || pinCode.trim().length === 0) {
            return null;
        }

        // GeoNames API endpoint
        const apiUrl = `http://api.geonames.org/postalCodeSearchJSON`;

        // Parameters for the API call
        const params = {
            postalcode: pinCode,
            maxRows: 1,
            username: 'yasirarafaat' // This should ideally be moved to environment variables
        };

        // Make the API request
        const response = await axios.get<GeoNamesResponse>(apiUrl, { params });

        // Check if we got any results
        if (response.data.postalCodes && response.data.postalCodes.length > 0) {
            const location = response.data.postalCodes[0];

            // Map country code to country name
            const countryName = location.countryCode ? (countryCodeToNameMap[location.countryCode] || location.countryCode) : '';

            return {
                country: countryName,
                state: location.adminName1 || '',
                city: location.adminName2 || location.placeName || ''
            };
        }

        // No results found
        return null;
    } catch (error) {
        console.error('Error fetching location data from GeoNames API:', error);
        // Return null to indicate failure
        return null;
    }
};