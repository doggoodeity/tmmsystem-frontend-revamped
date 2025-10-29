import apiClient from './apiConfig';

export const quoteService = {
    // Test RFQ endpoints
    discoverEndpoints: async () => {
        const possibleEndpoints = [
            '/v1/rfqs',
            '/v1/rfq',
            '/v1/quote-requests',
            '/v1/quotations',
            '/v1/requests'
        ];

        console.log('Testing RFQ endpoints...');

        for (const endpoint of possibleEndpoints) {
            try {
                const response = await apiClient.get(endpoint);
                console.log(`Found working endpoint: ${endpoint}`, response.data);
                console.log(`Data length:`, response.data?.length || 'Not an array');
                return { endpoint, data: response.data };
            } catch (error) {
                console.log(`${endpoint}: ${error.response?.status || 'Network Error'}`);
            }
        }

        console.log('No RFQ endpoints found');
        return null;
    },

    // Submit a new RFQ (quote request) from customer
    submitQuoteRequest: async (rfqData) => {
        try {
            console.log('=== SUBMITTING RFQ ===');
            console.log('Original rfqData:', rfqData);

            // Get current user ID for createdById
            const userId = parseInt(localStorage.getItem('userId')) || 1;

            // Generate a temporary RFQ number (backend might override this)
            const timestamp = Date.now();
            const rfqNumber = `RFQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${timestamp.toString().slice(-6)}`;

            const payload = {
                rfqNumber: rfqNumber, // Add the missing rfqNumber
                customerId: rfqData.customerId,
                expectedDeliveryDate: rfqData.expectedDeliveryDate,
                status: 'DRAFT',
                isSent: false,
                notes: 'Customer quote request',
                createdById: userId,
                details: rfqData.details.map(detail => ({
                    productId: detail.productId,
                    quantity: detail.quantity,
                    unit: 'pcs',
                    notes: detail.size || 'Standard'
                }))
            };

            console.log('API payload:', JSON.stringify(payload, null, 2));
            console.log('Making POST request to: /v1/rfqs');

            const response = await apiClient.post('/v1/rfqs', payload);
            console.log('API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('=== RFQ SUBMISSION ERROR ===');
            console.error('Status:', error.response?.status);
            console.error('Status Text:', error.response?.statusText);
            console.error('Error Data:', error.response?.data);
            console.error('Full Error:', error);
            throw new Error(error.response?.data?.message || 'Lỗi khi gửi yêu cầu báo giá');
        }
    },

    // Get all RFQs (for sales staff)
    getAllQuoteRequests: async () => {
        try {
            console.log('Fetching RFQs from /v1/rfqs...');
            const response = await apiClient.get('/v1/rfqs');
            console.log('Raw RFQ response:', response.data);

            if (response.data && response.data.length > 0) {
                console.log('First RFQ structure:', Object.keys(response.data[0]));
                console.log('First RFQ data:', response.data[0]);
            }

            return response.data || [];
        } catch (error) {
            console.error('RFQ fetch error:', error);
            throw new Error(error.response?.data?.message || 'Lỗi khi tải danh sách yêu cầu báo giá');
        }
    },

    // Get RFQ details
    getRFQDetails: async (rfqId) => {
        try {
            console.log(`=== FETCHING RFQ DETAILS ===`);
            console.log(`Requesting RFQ ID: ${rfqId}`);
            console.log(`Making GET request to: /v1/rfqs/${rfqId}`);

            const response = await apiClient.get(`/v1/rfqs/${rfqId}`);

            console.log('RFQ details response status:', response.status);
            console.log('RFQ details response data:', response.data);

            if (response.data) {
                console.log('RFQ details structure:', Object.keys(response.data));
                if (response.data.details) {
                    console.log('RFQ details count:', response.data.details.length);
                    console.log('First detail item:', response.data.details[0]);
                }
            }

            return response.data;
        } catch (error) {
            console.error('=== RFQ DETAILS FETCH ERROR ===');
            console.error('Status:', error.response?.status);
            console.error('Status Text:', error.response?.statusText);
            console.error('Error Data:', error.response?.data);
            console.error('Full Error:', error);
            throw new Error(error.response?.data?.message || 'Lỗi khi tải chi tiết RFQ');
        }
    },

    // Get all customers
    getAllCustomers: async () => {
        try {
            console.log('Trying to fetch customers from /v1/customers...');
            const response = await apiClient.get('/v1/customers');
            console.log('Customers response:', response.data);
            return response.data || [];
        } catch (error) {
            console.error('Customers fetch error:', error);
            return [];
        }
    },

    // Get customer by ID
    getCustomerById: async (customerId) => {
        try {
            console.log(`Fetching customer ID: ${customerId}`);
            const response = await apiClient.get(`/v1/customers/${customerId}`);
            console.log('Customer details response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Customer details fetch error:', error);
            return null;
        }
    },

    // Update RFQ status (for sales staff operations)
    updateRFQStatus: async (rfqId, status) => {
        try {
            console.log(`Updating RFQ ${rfqId} status to: ${status}`);
            const response = await apiClient.patch(`/v1/rfqs/${rfqId}`, {
                status: status,
                isSent: status === 'SENT'
            });
            console.log('RFQ status update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('RFQ status update error:', error);
            throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái RFQ');
        }
    },

    // Send RFQ to Planning Department (update status to SENT)
    sendRFQToPlanningDepartment: async (rfqId) => {
        try {
            console.log(`=== SENDING RFQ TO PLANNING ===`);
            console.log(`RFQ ID: ${rfqId}`);

            // First, get the current RFQ data
            const currentRFQ = await apiClient.get(`/v1/rfqs/${rfqId}`);
            console.log('Current RFQ data:', currentRFQ.data);

            // Update only the status and isSent fields
            const payload = {
                ...currentRFQ.data,
                status: 'SENT',
                isSent: true,
                updatedAt: new Date().toISOString()
            };

            console.log('Update payload:', payload);
            console.log(`Making PUT request to: /v1/rfqs/${rfqId}`);

            const response = await apiClient.put(`/v1/rfqs/${rfqId}`, payload);

            console.log('Send RFQ response status:', response.status);
            console.log('Send RFQ response data:', response.data);

            return response.data;
        } catch (error) {
            console.error('=== SEND RFQ ERROR ===');
            console.error('Status:', error.response?.status);
            console.error('Status Text:', error.response?.statusText);
            console.error('Error Data:', error.response?.data);
            console.error('Full Error:', error);
            throw new Error(error.response?.data?.message || 'Lỗi khi gửi RFQ đến Phòng Kế hoạch');
        }
    },

    // Get pricing data for quote calculation
    getQuotePricing: async (rfqId) => {
        try {
            console.log(`=== FETCHING QUOTE PRICING ===`);
            console.log(`RFQ ID: ${rfqId}`);

            const response = await apiClient.get(`/v1/quotes/pricing/${rfqId}`);

            console.log('Quote pricing response:', response.data);
            return response.data;
        } catch (error) {
            console.error('=== QUOTE PRICING FETCH ERROR ===');
            console.error('Status:', error.response?.status);
            console.error('Error Data:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Lỗi khi tải thông tin báo giá');
        }
    },

    // Create a new quote
    createQuote: async (quoteData) => {
        try {
            console.log(`=== CREATING QUOTE ===`);
            console.log('Quote data:', quoteData);

            const response = await apiClient.post(`/v1/quotes`, quoteData);

            console.log('Create quote response:', response.data);
            return response.data;
        } catch (error) {
            console.error('=== CREATE QUOTE ERROR ===');
            console.error('Status:', error.response?.status);
            console.error('Error Data:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Lỗi khi tạo báo giá');
        }
    },

    // Calculate quote price
    calculateQuotePrice: async (rfqId, profitMargin) => {
        try {
            console.log(`=== CALCULATING QUOTE PRICE ===`);
            console.log(`RFQ ID: ${rfqId}, Profit Margin: ${profitMargin}%`);

            const response = await apiClient.post(`/v1/quotes/calculate`, {
                rfqId: rfqId,
                profitMargin: profitMargin
            });

            console.log('Price calculation response:', response.data);
            return response.data;
        } catch (error) {
            console.error('=== PRICE CALCULATION ERROR ===');
            console.error('Status:', error.response?.status);
            console.error('Error Data:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Lỗi khi tính toán giá báo giá');
        }
    },

    // Get quote details by quote ID
    getQuoteDetails: async (quoteId) => {
        try {
            console.log(`=== FETCHING QUOTE DETAILS ===`);
            console.log(`Quote ID: ${quoteId}`);

            const response = await apiClient.get(`/v1/quotes/${quoteId}`);

            console.log('Quote details response:', response.data);
            return response.data;
        } catch (error) {
            console.error('=== QUOTE DETAILS FETCH ERROR ===');
            console.error('Status:', error.response?.status);
            console.error('Error Data:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Lỗi khi tải chi tiết báo giá');
        }
    },

    // Get quotes for specific RFQ
    getQuotesForRFQ: async (rfqId) => {
        try {
            console.log(`=== FETCHING QUOTES FOR RFQ ===`);
            console.log(`RFQ ID: ${rfqId}`);

            const response = await apiClient.get(`/v1/quotes/rfq/${rfqId}`);

            console.log('RFQ quotes response:', response.data);
            return response.data;
        } catch (error) {
            console.error('=== RFQ QUOTES FETCH ERROR ===');
            console.error('Status:', error.response?.status);
            console.error('Error Data:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Lỗi khi tải báo giá cho RFQ');
        }
    },

    // Send quote to customer
    sendQuoteToCustomer: async (quoteId) => {
        try {
            console.log(`=== SENDING QUOTE TO CUSTOMER ===`);
            console.log(`Quote ID: ${quoteId}`);

            const response = await apiClient.put(`/v1/quotes/${quoteId}/send-to-customer`);

            console.log('Send quote response:', response.data);
            return response.data;
        } catch (error) {
            console.error('=== SEND QUOTE ERROR ===');
            console.error('Status:', error.response?.status);
            console.error('Error Data:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Lỗi khi gửi báo giá đến khách hàng');
        }
    },

    // Get all quotes (for Sales Staff)
    getAllQuotes: async () => {
        try {
            console.log(`=== FETCHING ALL QUOTES ===`);

            const response = await apiClient.get('/v1/quotes');

            console.log('All quotes response:', response.data);
            return response.data;
        } catch (error) {
            console.error('=== GET ALL QUOTES ERROR ===');
            console.error('Status:', error.response?.status);
            console.error('Error Data:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Lỗi khi tải danh sách báo giá');
        }
    },
};
