const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function test() {
    try {
        // 1. Login
        console.log("Logging in...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'testadmin@example.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log("Login successful. Token obtained.");

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Test Blacklist (Payment)
        console.log("Testing Blacklist...");
        try {
            await axios.post(`${API_URL}/payment`, {
                amount: 10,
                currency: 'USD',
                cardToken: 'tok_visa',
                description: 'Test Payment'
            }, { headers });
            console.error("FAIL: Payment succeeded but should have been blocked by blacklist.");
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error === "Transaction blocked due to security policies.") {
                console.log("SUCCESS: Payment blocked by blacklist as expected.");
            } else {
                console.error("FAIL: Payment failed with unexpected error:", error.response ? error.response.data : error.message);
            }
        }

        // 3. Test KYC
        console.log("Testing KYC...");
        try {
            const kycRes = await axios.post(`${API_URL}/user/kyc`, {}, { headers });
            console.log("SUCCESS: KYC submitted.", kycRes.data);
        } catch (error) {
            console.error("FAIL: KYC submission failed:", error.response ? error.response.data : error.message);
        }

        // 4. Test Admin Dashboard
        console.log("Testing Admin Dashboard...");
        try {
            const statsRes = await axios.get(`${API_URL}/admin/dashboard`, { headers });
            console.log("SUCCESS: Admin Dashboard stats:", statsRes.data);
        } catch (error) {
            console.error("FAIL: Admin Dashboard failed:", error.response ? error.response.data : error.message);
        }

    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();
