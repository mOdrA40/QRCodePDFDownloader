/**
 * Geolocation Service
 * Detects user's country based on IP address for better UX
 */

import type { Country } from "react-phone-number-input"

interface GeolocationResponse {
  country_code?: string
  country?: string
  error?: string
}

interface CountryDetectionResult {
  country: Country
  detected: boolean
  source: 'ip' | 'fallback'
}

class GeolocationService {
  private readonly fallbackCountry: Country = "ID" // Indonesia as fallback
  private readonly timeout = 5000 // 5 seconds timeout
  private cachedCountry: Country | null = null
  private detectionAttempted = false

  /**
   * Detects user's country based on IP address
   * Uses multiple free IP geolocation services with fallback
   */
  async detectUserCountry(): Promise<CountryDetectionResult> {
    // Return cached result if available
    if (this.detectionAttempted && this.cachedCountry) {
      return {
        country: this.cachedCountry,
        detected: this.cachedCountry !== this.fallbackCountry,
        source: this.cachedCountry !== this.fallbackCountry ? 'ip' : 'fallback'
      }
    }

    this.detectionAttempted = true

    try {
      // Try multiple services for better reliability
      const services = [
        'https://ipapi.co/json/',
        'https://ip-api.com/json/',
        'https://ipinfo.io/json'
      ]

      for (const serviceUrl of services) {
        try {
          const country = await this.tryService(serviceUrl)
          if (country && this.isValidCountryCode(country)) {
            this.cachedCountry = country
            return {
              country,
              detected: true,
              source: 'ip'
            }
          }
        } catch (error) {
          // Continue to next service
          console.warn(`Geolocation service ${serviceUrl} failed:`, error)
        }
      }

      // All services failed, use fallback
      this.cachedCountry = this.fallbackCountry
      return {
        country: this.fallbackCountry,
        detected: false,
        source: 'fallback'
      }
    } catch (error) {
      console.warn('Country detection failed, using fallback:', error)
      this.cachedCountry = this.fallbackCountry
      return {
        country: this.fallbackCountry,
        detected: false,
        source: 'fallback'
      }
    }
  }

  /**
   * Tries a specific geolocation service
   */
  private async tryService(url: string): Promise<Country | null> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data: GeolocationResponse = await response.json()
      
      // Different services use different field names
      const countryCode = data.country_code || data.country
      
      if (countryCode && typeof countryCode === 'string') {
        return countryCode.toUpperCase() as Country
      }

      return null
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  /**
   * Validates if the country code is supported by react-phone-number-input
   */
  private isValidCountryCode(code: string): boolean {
    // Basic validation - should be 2 letter ISO code
    return /^[A-Z]{2}$/.test(code)
  }

  /**
   * Gets the fallback country
   */
  getFallbackCountry(): Country {
    return this.fallbackCountry
  }

  /**
   * Clears the cached country (useful for testing)
   */
  clearCache(): void {
    this.cachedCountry = null
    this.detectionAttempted = false
  }

  /**
   * Gets cached country without making new requests
   */
  getCachedCountry(): Country | null {
    return this.cachedCountry
  }
}

// Export singleton instance
export const geolocationService = new GeolocationService()
export type { CountryDetectionResult }
