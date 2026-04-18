const { google } = require('googleapis');
const logger = require('../utils/logger');

/**
 * Service to interact with the Google Indexing API.
 * Uses the service account credentials from GOOGLE_APPLICATION_CREDENTIALS.
 */
class GoogleIndexingService {
  constructor() {
    this.jwtClient = null;
    this.isConfigured = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  /**
   * Initializes the JWT client.
   */
  async init() {
    if (!this.isConfigured) {
      logger.warn('Google Indexing API is not configured (GOOGLE_APPLICATION_CREDENTIALS is missing).');
      return;
    }

    try {
      this.jwtClient = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/indexing'],
      });
      // Test the auth client
      await this.jwtClient.getClient();
      logger.info('Google Indexing API auth initialized.');
    } catch (error) {
      logger.error('Error initializing Google Indexing API Auth:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Notifies Google of a URL update or deletion.
   * @param {string} url - The URL to be indexed.
   * @param {string} type - 'URL_UPDATED' or 'URL_DELETED'.
   * @returns {Promise<object>} The API response.
   */
  async publishURL(url, type = 'URL_UPDATED') {
    if (!this.isConfigured || !this.jwtClient) {
      return { success: false, message: 'Google Indexing API not configured.' };
    }

    try {
      const indexing = google.indexing({ version: 'v3', auth: this.jwtClient });
      
      const response = await indexing.urlNotifications.publish({
        requestBody: {
          url: url,
          type: type,
        },
      });

      logger.info(`Google Indexing API notification sent for ${url} (${type})`);
      return { success: true, data: response.data };
    } catch (error) {
      logger.error(`Error notifying Google Indexing API for ${url}:`, error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Gets the current indexing status of a URL.
   * @param {string} url - The URL to check.
   * @returns {Promise<object>} The API response.
   */
  async getMetadata(url) {
    if (!this.isConfigured || !this.jwtClient) {
      return { success: false, message: 'Google Indexing API not configured.' };
    }

    try {
      const indexing = google.indexing({ version: 'v3', auth: this.jwtClient });
      
      const response = await indexing.urlNotifications.getMetadata({
        url: encodeURIComponent(url),
      });

      return { success: true, data: response.data };
    } catch (error) {
      logger.error(`Error getting metadata from Google Indexing API for ${url}:`, error.message);
      return { success: false, message: error.message };
    }
  }
}

const indexingService = new GoogleIndexingService();
// Initialize immediately
indexingService.init();

module.exports = indexingService;
